const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const router = express.Router();

// Rate limiting para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP cada 15 minutos
  message: {
    error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para registro (aumentado para desarrollo)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos (reducido de 1 hora)
  max: 150, // máximo 10 registros por IP cada 15 minutos (aumentado de 3)
  message: {
    error: 'Demasiados intentos de registro. Intenta de nuevo en 15 minutos.'
  }
});

// Rate limiting para recuperar contraseña
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 intentos por IP cada hora
  message: {
    error: 'Demasiados intentos de recuperación. Intenta de nuevo en 1 hora.'
  }
});



// Configuración del transportador de email para Gmail
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verificar conexión SMTP (opcional, para debugging)
emailTransporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error de configuración Gmail:', error.message);
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('🔧 Solución: Crea el archivo server/.env copiando env.example y configura:');
      console.log('   - SMTP_USER=tu_email@gmail.com');
      console.log('   - SMTP_PASS=tu_contraseña_de_aplicacion_de_gmail');
      console.log('   📖 Guía: https://support.google.com/accounts/answer/185833');
    }
  } else {
    console.log('✅ Gmail configurado correctamente - Listo para enviar emails');
  }
});

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Acceso denegado. No se proporcionó token.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido.' 
    });
  }
};

// Validaciones de entrada
const loginValidation = [
  body('usuario')
    .notEmpty()
    .withMessage('El usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener entre 3 y 50 caracteres')
    .trim()
    .escape(),
  body('contraseña')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

const registerValidation = [
  body('usuario')
    .notEmpty()
    .withMessage('El usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('El usuario solo puede contener letras, números, guiones y guiones bajos')
    .trim()
    .escape(),
  body('contraseña')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('La contraseña debe contener al menos: 1 minúscula y 1 mayúscula'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
];

// LOGIN
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { usuario, contraseña } = req.body;

    // Buscar usuario en la base de datos
    const query = 'SELECT * FROM Usuarios WHERE usuario = ?';
    const users = await req.requestDB({
      query,
      values: [usuario],
      errMsg: 'Error al buscar usuario'
    });

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        usuario: user.usuario,
        email: user.email 
      },
      process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura',
      { expiresIn: '24h' }
    );

    // Actualizar último login
    await req.requestDB({
      query: 'UPDATE Usuarios SET ultimo_login = NOW() WHERE id = ?',
      values: [user.id],
      errMsg: 'Error al actualizar último login'
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        usuario: user.usuario,
        email: user.email,
        ultimo_login: new Date()
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// REGISTRO
router.post('/register', registerLimiter, registerValidation, async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { usuario, contraseña, email } = req.body;

    // Verificar si el usuario ya existe
    const existingUsers = await req.requestDB({
      query: 'SELECT * FROM Usuarios WHERE usuario = ? OR email = ?',
      values: [usuario, email],
      errMsg: 'Error al verificar usuario existente'
    });

    if (existingUsers.length > 0) {
      const existingField = existingUsers[0].usuario === usuario ? 'usuario' : 'email';
      return res.status(409).json({
        success: false,
        message: `El ${existingField} ya está registrado`
      });
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    // Crear usuario
    const result = await req.requestDB({
      query: 'INSERT INTO Usuarios (usuario, contraseña, email, fecha_registro) VALUES (?, ?, ?, NOW())',
      values: [usuario, hashedPassword, email],
      errMsg: 'Error al crear usuario'
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: result.insertId, 
        usuario: usuario,
        email: email 
      },
      process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.insertId,
        usuario: usuario,
        email: email,
        fecha_registro: new Date()
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// RECUPERAR CONTRASEÑA - Solicitar reset
router.post('/forgot-password', resetLimiter, [
  body('email').isEmail().withMessage('Debe ser un email válido').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Buscar usuario por email
    const users = await req.requestDB({
      query: 'SELECT * FROM Usuarios WHERE email = ?',
      values: [email],
      errMsg: 'Error al buscar usuario'
    });

    // Siempre responder exitosamente para no revelar si el email existe
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    const user = users[0];

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en la base de datos
    await req.requestDB({
      query: 'UPDATE Usuarios SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      values: [resetToken, resetTokenExpiry, user.id],
      errMsg: 'Error al guardar token de reset'
    });

    // Enviar email (solo si está configurado)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      
      await emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Restablecer contraseña - Cabalgata',
        html: `
          <h2>Restablecer contraseña</h2>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
          <p>Este enlace expira en 1 hora.</p>
          <p>Si no solicitaste este cambio, ignora este email.</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    });

  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// RESTABLECER CONTRASEÑA
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token requerido'),
  body('nuevaContraseña')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('La contraseña debe contener al menos: 1 minúscula y 1 mayúscula')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { token, nuevaContraseña } = req.body;

    // Buscar usuario con token válido
    const users = await req.requestDB({
      query: 'SELECT * FROM Usuarios WHERE reset_token = ? AND reset_token_expiry > NOW()',
      values: [token],
      errMsg: 'Error al verificar token'
    });

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    const user = users[0];

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(nuevaContraseña, saltRounds);

    // Actualizar contraseña y limpiar token
    await req.requestDB({
      query: 'UPDATE Usuarios SET contraseña = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      values: [hashedPassword, user.id],
      errMsg: 'Error al actualizar contraseña'
    });

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// VERIFICAR TOKEN
router.get('/verify-token', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// CAMBIAR CONTRASEÑA (usuario autenticado)
router.post('/change-password', verifyToken, [
  body('contraseñaActual').notEmpty().withMessage('Contraseña actual requerida'),
  body('nuevaContraseña')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('La contraseña debe contener al menos: 1 minúscula y 1 mayúscula')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { contraseñaActual, nuevaContraseña } = req.body;
    const userId = req.user.id;

    // Obtener usuario actual
    const users = await req.requestDB({
      query: 'SELECT * FROM Usuarios WHERE id = ?',
      values: [userId],
      errMsg: 'Error al obtener usuario'
    });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(contraseñaActual, user.contraseña);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(nuevaContraseña, saltRounds);

    // Actualizar contraseña
    await req.requestDB({
      query: 'UPDATE Usuarios SET contraseña = ? WHERE id = ?',
      values: [hashedPassword, userId],
      errMsg: 'Error al actualizar contraseña'
    });

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('Error en change password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = { router, verifyToken };
