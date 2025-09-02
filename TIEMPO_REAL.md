# Implementación de Tiempo Real

## Resumen

Se ha implementado funcionalidad de tiempo real en la aplicación de gestión de cabalgata usando WebSockets (Socket.IO). Esto permite que múltiples usuarios vean actualizaciones inmediatas cuando se crean, modifican o eliminan registros.

## Arquitectura

### Backend (Servidor)
- **Socket.IO Server**: Configurado en `server/index.js`
- **Eventos automáticos**: Se emiten eventos cuando se realizan operaciones CRUD
- **Eventos disponibles**:
  - `Socios_created` - Nuevo socio creado
  - `Socios_updated` - Socio actualizado 
  - `Socios_deleted` - Socio eliminado
  - `Recibos_created` - Nuevo recibo creado
  - `Recibos_updated` - Recibo actualizado
  - `Recibos_deleted` - Recibo eliminado
  - `Pagos_created` - Nuevo pago registrado
  - `Pagos_updated` - Pago actualizado
  - `Pagos_deleted` - Pago eliminado
  - `Cortejos_created/updated/deleted` - Operaciones con cortejos
  - `Carrozas_created/updated/deleted` - Operaciones con carrozas
  - `Socios_Carrozas_created/updated/deleted` - Operaciones con asignaciones

### Frontend (Cliente)
- **WebSocketContext**: Contexto React para manejar la conexión WebSocket
- **useRealTimeData**: Hook personalizado para sincronizar datos en tiempo real
- **Indicadores visuales**: Puntos de conexión que muestran el estado en tiempo real

## Archivos Modificados

### Nuevos Archivos
- `src/context/WebSocketContext.tsx` - Contexto para manejar WebSocket
- `src/hooks/useRealTimeData.ts` - Hook para datos en tiempo real

### Archivos Modificados
- `server/index.js` - Agregado soporte WebSocket y eventos
- `server/package.json` - Agregada dependencia socket.io
- `src/App.tsx` - Agregado WebSocketProvider
- `src/pages/socios/Socios.tsx` - Convertido a tiempo real
- `src/pages/Recibos/Recibos.tsx` - Convertido a tiempo real
- `src/pages/Cortejos/Cortejos.tsx` - Convertido a tiempo real (parcial)
- `src/pages/Papeletas/Papeletas.tsx` - Convertido a tiempo real

## Características

### 1. Sincronización Automática
- Los cambios se propagan automáticamente a todos los clientes conectados
- No se requiere recargar la página para ver actualizaciones

### 2. Notificaciones Toast
- Los usuarios reciben notificaciones cuando se realizan cambios
- Diferente tipo de notificación según la operación (crear, actualizar, eliminar)

### 3. Indicadores de Conexión
- Punto verde: Conectado en tiempo real
- Punto rojo: Desconectado
- Texto informativo del estado

### 4. Manejo de Reconexión
- Reconexión automática si se pierde la conexión
- Reintentos configurables

## Configuración

### Variables de Entorno (Servidor)
```env
CLIENT_URL=http://localhost:5173  # URL del cliente para CORS
```

### Variables de Entorno (Cliente)
```env
VITE_URL_SERVER=http://localhost:3001/api  # URL del servidor API
```

## Uso del Hook useRealTimeData

```typescript
const { data, isConnected } = useRealTimeData<TipoEntidad>({
  initialData: datosIniciales,
  eventPrefix: 'NombreTabla', // e.g., 'Socios', 'Recibos'
  onCreated: (item) => console.log('Creado:', item),
  onUpdated: (item) => console.log('Actualizado:', item),
  onDeleted: (id) => console.log('Eliminado:', id)
});
```

## Beneficios

1. **Experiencia de Usuario Mejorada**: Los usuarios ven cambios inmediatamente
2. **Colaboración en Tiempo Real**: Múltiples usuarios pueden trabajar simultáneamente
3. **Datos Actualizados**: Siempre se muestra la información más reciente
4. **Notificaciones Informativas**: Los usuarios saben qué está pasando en el sistema

## Consideraciones de Rendimiento

- Los eventos solo se emiten cuando hay cambios reales
- La reconexión es automática pero limitada a 5 intentos
- Los datos se sincronizan de forma eficiente sin sobrecargar el servidor

## Próximos Pasos

1. Implementar tiempo real para parientes
2. ✅ ~~Agregar tiempo real para pagos~~ (COMPLETADO)
3. ✅ ~~Implementar tiempo real para papeletas~~ (COMPLETADO)
4. Considerar salas específicas para diferentes secciones
5. Implementar persistencia de eventos offline
6. Optimizar sincronización de datos filtrados en pagos
