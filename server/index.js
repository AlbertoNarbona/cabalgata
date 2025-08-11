const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env
// Especificar la ruta al archivo .env (ajustar si es necesario)
const result = dotenv.config({ path: path.resolve(__dirname, '.env') });

// Verificar si hubo error al cargar .env
if (result.error) {
  console.error('Error al cargar el archivo .env:', result.error);
  // Intentar cargar desde una ruta alternativa
  const altResult = dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
  });
  if (altResult.error) {
    console.error('No se pudo cargar el archivo .env desde rutas alternativas');
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
};

const poolCabalgatas = mysql.createPool(poolConfig);

// Middleware
app.use(cors());
app.use(express.json());

// Función para obtener datos de la base de datos
const requestDB = ({query, values, errMsg}) => {
  return new Promise((resolve, reject) => {
    let queryParams;
    queryParams = values ? mysql.format(query, values) : query;

    poolCabalgatas.query(queryParams, (err, results) => {
      if (err) {
        reject(`Error manejado: ${errMsg}. Error devuelto: ${err}`);
        return;
      }
      resolve(results);
    });
  });
};


// Función para reorganizar IDs después de eliminar un registro
const reorganizarIds = async (idEliminado) => {
  try {
    
    // Obtener el ID máximo actual para evitar conflictos
    const maxIdQuery = 'SELECT MAX(id) as maxId FROM Socios';
    const maxIdResult = await requestDB({query: maxIdQuery, errMsg: 'Error al obtener ID máximo'});
    const maxId = maxIdResult[0]?.maxId || 0;
    
    
    // Actualizar IDs de socios mayores al eliminado (restar 1)
    // Con ON UPDATE CASCADE, las foreign keys se actualizarán automáticamente
    const actualizarSociosQuery = 'UPDATE Socios SET id = id - 1 WHERE id > ?';
    const result = await requestDB({
      query: actualizarSociosQuery, 
      values: [idEliminado], 
      errMsg: 'Error al actualizar IDs de socios'
    });
    
    // Ajustar el autoincrement para que el próximo ID sea correlativo
    if (maxId > 0) {
      const ajustarAutoincrementQuery = 'ALTER TABLE Socios AUTO_INCREMENT = ?';
      await requestDB({
        query: ajustarAutoincrementQuery,
        values: [maxId],
        errMsg: 'Error al ajustar autoincrement'
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('Error al reorganizar IDs:', error);
    throw error;
  }
};

// Rutas para socios
app.get('/api/table/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;

    
      const query = mysql.format(`SELECT * FROM ?? WHERE id = ?`, [table, id]);
      const data = await requestDB({query, errMsg: `Error al obtener ${table}`});
      
      return res.json(data);

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener registros con id, ' + error
    });
  }
});


  app.get('/api/table/:table', async (req, res) => {
  try {
    const { table } = req.params;

      const query = `SELECT * FROM ??`;

      const data = await requestDB({query, values: [table], errMsg: `Error al obtener ${table}`});
      return res.json(data);

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener registros sin id, ' + error
    });
  }
});
  
app.get('/api/tableSecondary/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;

    let query;

    if (table === 'Carrozas') {
      query = `SELECT * FROM Carrozas WHERE cortejo_id = ?`;
    } else if (table === 'Socios_Carrozas') {
      query = `SELECT * FROM Socios_Carrozas WHERE carroza_id = ?`;
    }

      const data = await requestDB({query, values: [id], errMsg: `Error al obtener ${table}`});

      return res.json(data);

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener registros secundarios'
    });
  }
});

app.post('/api/table/:table', async (req, res) => {
  try {
    const { table } = req.params;

    const campos = Object.keys(req.body).map(campo => `\`${campo}\``).join(', ');
    const placeholders = Object.keys(req.body).map(() => '?').join(', ');
    const values = Object.values(req.body);

    // Query segura: solo placeholders para los valores
    const query = `INSERT INTO \`${table}\` (${campos}) VALUES (${placeholders})`;

    const response = await requestDB({query, values, errMsg: 'Error al crear socio'});

    return res.status(200).json({
      success: true,
      message: 'Registro creado correctamente',
      record: {id: response.insertId, ...req.body}
    });
    
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear registro'
    });
  }
});

app.put('/api/table/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { id } = req.body;
    
    const campos = Object.keys(req.body).map(campo => `${campo} = ?`).join(', ');
    
    const query = `UPDATE ?? SET ${campos} WHERE id = ?`;
    const values = [table, ...Object.values(req.body), id];  

    const response = await requestDB({query, values, errMsg: 'Error al actualizar socio'});
    
    return res.status(200).json({
      success: true,
      message: 'Registro actualizado correctamente',
      record: req.body
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar socio'
    });
  }
});

app.delete('/api/table/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de socio requerido'
      });
    }
    
    const query = `DELETE FROM ?? WHERE id = ?`;
    const values = [table, id];
    const response = await requestDB({query, values, errMsg: 'Error al eliminar socio'});

    let responseParientes = null;
    if (table === 'Socios') {
    // Eliminar parientes del socio
    const queryParientes = `DELETE FROM Parientes WHERE socio_id = ?`;
    const valuesParientes = [id];
    responseParientes = await requestDB({query: queryParientes, values: valuesParientes, errMsg: 'Error al eliminar parientes'});
    
    await reorganizarIds(id);
    }

    return res.json({
      success: true,
      message: 'Registro eliminado correctamente',
      record: {id, ...response},
      parientes: responseParientes
    });
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar socio'
    });
  }
});

// Ruta para verificar el estado de las asignaciones
app.get('/api/debug/asignaciones', (req, res) => {
  try {
    const asignacionesConInfo = sociosCarrozasDB.map(asignacion => {
      const socio = sociosDB.find(s => s.id === asignacion.socio_id);
      const carroza = carrozasDB.find(c => c.id === asignacion.carroza_id);
      const cortejo = cortejosDB.find(co => co.id === carroza?.cortejo_id);
      
      return {
        id: asignacion.id,
        socio: socio?.nombre || 'No encontrado',
        carroza: carroza?.nombre || 'No encontrada',
        cortejo: cortejo?.nombre || 'No encontrado',
        tipo_usuario: asignacion.tipo_usuario,
        sitio: asignacion.sitio
      };
    });
    
    return res.json({
      totalAsignaciones: sociosCarrozasDB.length,
      asignaciones: asignacionesConInfo
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener información de debug'
    });
  }
});

app.post('/api/socios-carrozas/verificar-sitio', (req, res) => {
  try {
    const { carroza_id, sitio, tipo_usuario } = req.body;
    
    const sitioOcupado = sociosCarrozasDB.find(sc => 
      sc.carroza_id === parseInt(carroza_id) && 
      sc.sitio === sitio && 
      sc.tipo_usuario === tipo_usuario
    );
    
    return res.json({
      disponible: !sitioOcupado
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al verificar sitio'
    });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error del servidor:', error);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Estadísticas: http://localhost:${PORT}/api/stats`);
}); 