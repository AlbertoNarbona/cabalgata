# Sistema de Autenticación Seguro - Cabalgata

## 📋 Resumen

Se ha implementado un sistema de autenticación completo y seguro que incluye:

- ✅ **Login seguro** con validación de usuario y contrasena
- ✅ **Registro de usuarios** con validaciones robustas 
- ✅ **Recuperación de contrasena** por email
- ✅ **Hash de contraseñas** con bcryptjs (12 rounds)
- ✅ **Tokens JWT** para sesiones seguras
- ✅ **Rate limiting** para prevenir ataques de fuerza bruta
- ✅ **Validaciones exhaustivas** en frontend y backend
- ✅ **Rutas protegidas** que requieren autenticación
- ✅ **Interfaz de usuario** completamente en español

## 🔧 Instalación

### 1. Dependencias del Servidor

Instala las dependencias de seguridad en el servidor:

```bash
cd server
npm install bcryptjs jsonwebtoken nodemailer express-rate-limit express-validator helmet
```

### 2. Configuración de Base de Datos

Ejecuta el script SQL para actualizar la tabla de usuarios:

```bash
# Ejecutar en tu cliente MySQL
mysql -u tu_usuario -p tu_base_de_datos < server/sql/update_usuarios_table.sql
```

O ejecuta manualmente las sentencias SQL desde `server/sql/update_usuarios_table.sql`

### 3. Variables de Entorno

Crea un archivo `.env` en la carpeta `server/` basado en `server/env.example`:

```bash
cd server
cp env.example .env
```

Configura las variables en `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_DATABASE=cabalgata
DB_PORT=3306

# Servidor
PORT=3001
CLIENT_URL=http://localhost:5173

# JWT (¡IMPORTANTE! Cambia en producción)
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_en_produccion_con_al_menos_32_caracteres

# Email (para recuperar contrasena)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion_gmail
```

## 🚀 Funcionalidades Implementadas

### Backend (Node.js/Express)

**Archivos creados/modificados:**
- `server/routes/auth.js` - Rutas de autenticación
- `server/sql/update_usuarios_table.sql` - Script de base de datos
- `server/index.js` - Configuración de middleware de seguridad
- `server/env.example` - Ejemplo de variables de entorno

**Endpoints disponibles:**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/forgot-password` - Solicitar recuperación
- `POST /api/auth/reset-password` - Restablecer contrasena
- `POST /api/auth/change-password` - Cambiar contrasena (autenticado)
- `GET /api/auth/verify-token` - Verificar token JWT

### Frontend (React/TypeScript)

**Archivos creados/modificados:**
- `src/services/authService.ts` - Servicio de autenticación
- `src/context/AuthContext.tsx` - Contexto global de autenticación
- `src/components/auth/SignInForm.tsx` - Formulario de login
- `src/components/auth/SignUpForm.tsx` - Formulario de registro
- `src/components/auth/ForgotPasswordForm.tsx` - Recuperar contrasena
- `src/components/auth/ResetPasswordForm.tsx` - Restablecer contrasena
- `src/components/auth/ProtectedRoute.tsx` - Rutas protegidas
- `src/pages/AuthPages/ForgotPassword.tsx` - Página recuperar contrasena
- `src/pages/AuthPages/ResetPassword.tsx` - Página restablecer contrasena
- `src/App.tsx` - Configuración de rutas y contextos
- `src/layout/AppHeader.tsx` - Menú de usuario y logout

**Rutas disponibles:**
- `/login` - Iniciar sesión
- `/register` - Registro de usuario
- `/forgot-password` - Recuperar contrasena
- `/reset-password?token=...` - Restablecer contrasena
- Todas las demás rutas están protegidas y requieren autenticación

## 🔒 Características de Seguridad

### Contraseñas
- **Hash seguro:** bcryptjs con 12 rounds de salt
- **Validación estricta:** Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo
- **Comparación segura:** Sin almacenamiento en texto plano

### Tokens JWT
- **Expiración:** 24 horas
- **Payload mínimo:** Solo ID, usuario y email
- **Verificación:** En cada request a rutas protegidas

### Rate Limiting
- **Login:** 5 intentos por IP cada 15 minutos
- **Registro:** 3 intentos por IP cada hora
- **Recuperación:** 3 intentos por IP cada hora

### Validaciones
- **Backend:** express-validator con sanitización
- **Frontend:** Validación en tiempo real
- **Sanitización:** Escape de caracteres especiales

### Headers de Seguridad
- **Helmet.js:** Headers de seguridad automáticos
- **CORS:** Configurado para el dominio específico
- **Content-Type:** Validación estricta

## 📱 Experiencia de Usuario

### Formularios Inteligentes
- **Validación en tiempo real** mientras el usuario escribe
- **Mensajes de error específicos** para cada campo
- **Estados de carga** durante las peticiones
- **Feedback visual** con colores y iconos

### Responsive Design
- **Totalmente adaptable** a móviles y tablets
- **Dark mode** incluido en todos los componentes
- **Accessibility** con etiquetas ARIA apropiadas

### Gestión de Sesiones
- **Persistencia automática** del token en localStorage
- **Verificación continua** de autenticación
- **Redirección inteligente** después del login
- **Logout seguro** con limpieza de datos

## 🔧 Configuración de Email

Para la recuperación de contrasena, configura tu proveedor de email:

### Gmail
1. Habilita la autenticación de 2 factores
2. Genera una contrasena de aplicación
3. Usa esa contrasena en `SMTP_PASS`

### Otros proveedores
- **Outlook:** `smtp-mail.outlook.com:587`
- **Yahoo:** `smtp.mail.yahoo.com:587`
- **Custom SMTP:** Ajusta `SMTP_HOST` y `SMTP_PORT`

## 🚨 Importante para Producción

### Seguridad Crítica
1. **Cambia `JWT_SECRET`** por una clave de al menos 32 caracteres
2. **Configura HTTPS** en producción
3. **Actualiza CORS** con tu dominio real
4. **Habilita rate limiting** más estricto si es necesario
5. **Configura email real** para recuperación de contraseñas

### Variables de Entorno
```env
# PRODUCCIÓN
NODE_ENV=production
JWT_SECRET=clave_super_secreta_de_al_menos_32_caracteres_muy_dificil_de_adivinar
CLIENT_URL=https://tu-dominio.com
SMTP_USER=no-reply@tu-dominio.com
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica las credenciales en `.env`
- Asegúrate de que MySQL esté ejecutándose
- Confirma que la base de datos existe

### Error: "JWT token invalid"
- Verifica que `JWT_SECRET` esté configurado
- El token puede haber expirado (24h)
- Logout y login nuevamente

### Error: "Email not sent"
- Verifica configuración SMTP en `.env`
- Revisa que las credenciales de email sean correctas
- Confirma que el puerto SMTP esté abierto

### Error: "Rate limit exceeded"
- Espera el tiempo indicado en el mensaje
- Esto es normal para prevenir ataques
- En desarrollo, puedes reducir los límites

## 💡 Próximas Mejoras

Funcionalidades adicionales que se pueden implementar:

- **Verificación de email** para nuevos usuarios
- **Login con Google/redes sociales**
- **Autenticación de dos factores (2FA)**
- **Historial de sesiones** y dispositivos
- **Bloqueo automático** de cuentas tras intentos fallidos
- **Notificaciones de seguridad** por email

## 📞 Soporte

Si tienes problemas con la implementación:

1. Revisa los logs del servidor (`console.log` y `console.error`)
2. Verifica la consola del navegador para errores de frontend
3. Confirma que todas las dependencias estén instaladas
4. Asegúrate de que la base de datos esté actualizada

El sistema está diseñado para ser seguro y fácil de usar, siguiendo las mejores prácticas de la industria. ¡Disfruta de tu nueva autenticación segura! 🔐
