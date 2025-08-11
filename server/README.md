# Servidor Express - Gestión de Socios

Servidor backend para la aplicación de gestión de socios de la cabalgata.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con nodemon)
npm run dev

# Ejecutar en modo producción
npm start
```

## 📡 Endpoints de la API

### Socios

- **GET** `/api/socios` - Obtener todos los socios
- **POST** `/api/socios` - Crear nuevo socio
- **PUT** `/api/socios` - Actualizar socio existente
- **DELETE** `/api/socios/:id` - Eliminar socio (reorganiza IDs automáticamente)

### Parientes

- **GET** `/api/parientes` - Obtener todos los parientes
- **POST** `/api/parientes` - Crear nuevo pariente
- **DELETE** `/api/parientes/:id` - Eliminar pariente (reorganiza IDs automáticamente)

### Utilidades

- **GET** `/api/health` - Health check del servidor
- **GET** `/api/stats` - Estadísticas de socios y parientes

## 🔧 Configuración

El servidor corre por defecto en el puerto `3001`. Puedes cambiarlo usando la variable de entorno `PORT`:

```bash
PORT=3000 npm start
```

## 📊 Estructura de Datos

### Socio
```json
{
  "id": 1,
  "nombre": "Juan Pérez González",
  "direccion": "Calle Mayor 123, Madrid",
  "telefono": "+34 612 345 678",
  "email": "juan.perez@email.com",
  "cuota_anual": 150.00
}
```

### Pariente
```json
{
  "id": 1,
  "socio_id": 1,
  "nombre": "Ana Pérez García"
}
```

## 🔄 Reorganización de IDs

Cuando se elimina un socio:
1. Se eliminan todos los parientes asociados
2. Se reorganizan los IDs de socios (1, 2, 3...)
3. Se actualizan las referencias de parientes
4. Se reorganizan los IDs de parientes

## 🌐 CORS

El servidor está configurado con CORS habilitado para permitir peticiones desde el frontend.

## 📝 Logs

El servidor muestra logs en consola para:
- Inicio del servidor
- Errores de la aplicación
- Health check y estadísticas 