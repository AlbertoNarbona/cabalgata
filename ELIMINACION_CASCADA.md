# Eliminación en Cascada

## Descripción

Se ha implementado un sistema de eliminación en cascada que automáticamente elimina todos los elementos relacionados cuando se elimina un cortejo o carroza. Esto mantiene la integridad de los datos y evita registros huérfanos.

## Flujo de Eliminación

### 🗑️ Eliminar Cortejo
Cuando se elimina un cortejo, automáticamente se eliminan:

1. **Todas las carrozas** del cortejo
2. **Todas las asignaciones** de sitios de esas carrozas
3. **El cortejo** en sí

**Orden de eliminación:**
```
Cortejo → Asignaciones de todas las carrozas → Carrozas → Cortejo
```

### 🗑️ Eliminar Carroza
Cuando se elimina una carroza, automáticamente se eliminan:

1. **Todas las asignaciones** de sitios de esa carroza
2. **La carroza** en sí

**Orden de eliminación:**
```
Carroza → Asignaciones de la carroza → Carroza
```

## Implementación Técnica

### Backend (Servidor)
- **Archivo**: `server/index.js`
- **Endpoint**: `DELETE /api/table/:table/:id`
- **Lógica de cascada**:
  - Detecta el tipo de tabla (`Cortejos` o `Carrozas`)
  - Ejecuta eliminaciones en el orden correcto
  - Emite eventos WebSocket para tiempo real
  - Retorna información sobre elementos eliminados

### Frontend (Cliente)
- **Servicios actualizados**: `src/services/cortejosService.ts`
- **Componente**: `src/pages/Cortejos/Cortejos.tsx`
- **Características**:
  - Notificaciones informativas con detalles de eliminación
  - Actualización automática por WebSocket
  - Mensajes de confirmación detallados

## Respuesta del Servidor

```json
{
  "success": true,
  "message": "Registro eliminado correctamente",
  "record": { "id": 123 },
  "cascadeDeleted": {
    "carrozas": 3,
    "asignaciones": 15
  }
}
```

## Notificaciones al Usuario

### Cortejo Eliminado
```
✅ Cortejo eliminado correctamente. También se eliminaron: 3 carrozas y 15 asignaciones
```

### Carroza Eliminada
```
✅ Carroza eliminada correctamente. También se eliminaron 5 asignaciones
```

## Eventos WebSocket

Cuando se produce una eliminación en cascada, se emiten los siguientes eventos:

1. **Por cada asignación eliminada**: `Socios_Carrozas_deleted`
2. **Por cada carroza eliminada**: `Carrozas_deleted`
3. **Por el elemento principal**: `Cortejos_deleted` o `Carrozas_deleted`

## Beneficios

### ✅ Integridad de Datos
- No quedan registros huérfanos
- Consistencia automática en la base de datos
- Eliminación atómica (todo o nada)

### ✅ Experiencia de Usuario
- Información clara sobre qué se eliminó
- Actualizaciones en tiempo real en todas las pantallas
- Confirmaciones detalladas

### ✅ Mantenimiento
- Reduce la necesidad de limpieza manual
- Previene errores de referencia
- Simplifica la gestión de datos

## Consideraciones de Seguridad

1. **Confirmación**: Se recomienda pedir confirmación antes de eliminar
2. **Permisos**: Solo usuarios autorizados pueden eliminar
3. **Auditoría**: Los logs del servidor registran todas las eliminaciones

## Casos de Uso

### Reorganización de Cortejos
Si necesitas reestructurar completamente un cortejo:
1. Elimina el cortejo existente (se eliminan carrozas y asignaciones)
2. Crea un nuevo cortejo
3. Recrea las carrozas necesarias
4. Reasigna las personas

### Eliminación de Carroza Problemática
Si una carroza tiene problemas o cambios:
1. Elimina la carroza (se eliminan las asignaciones)
2. Crea una nueva carroza si es necesario
3. Reasigna las personas desde la página de Cortejos

## Logs del Servidor

```
🗑️ Eliminando cortejo 5 y todos sus elementos relacionados
🗑️ Eliminadas 15 asignaciones
🗑️ Eliminadas 3 carrozas
✅ Eliminación en cascada completada: { carrozas: 3, asignaciones: 15 }
```

Este sistema asegura que la base de datos se mantenga limpia y consistente, mientras proporciona feedback claro al usuario sobre las acciones realizadas.
