# Corrección: Papeletas de Sitio - Solo Parientes Asignados

## Problema Identificado

**Antes**: Cuando se asignaba un pariente específico a una carroza, en las papeletas aparecían TODOS los parientes de ese socio, no solo el que estaba realmente asignado.

**Ahora**: Solo aparecen los parientes que están específicamente asignados a carrozas.

## Ejemplo Práctico

### Situación:
- **Socio**: Juan Pérez (ID: 10)
- **Parientes**: 
  - Ana Pérez (ID: 15) - Hija
  - Carlos Pérez (ID: 16) - Hijo  
  - María Pérez (ID: 17) - Esposa

### Asignaciones en Cortejos:
- Juan Pérez → Carroza A, Sitio 1 (tipo: carroza)
- Ana Pérez → Carroza B, Sitio 3_p15 (tipo: beduino)

### Resultado ANTES (❌ Incorrecto):
**Papeleta de Juan Pérez:**
```
Socio: Juan Pérez
Carroza: Carroza A, Sitio: 1
Parientes: Ana Pérez, Carlos Pérez, María Pérez  ← TODOS aparecían
```

**Papeleta de Ana Pérez:**
```
Socio: Juan Pérez  
Carroza: Carroza B, Sitio: 3_p15
Parientes: Ana Pérez  ← Solo la asignada
```

### Resultado AHORA (✅ Correcto):
**Papeleta de Juan Pérez:**
```
Socio: Juan Pérez
Carroza: Carroza A, Sitio: 1
Parientes: Ana Pérez  ← Solo los que están asignados a carrozas
```

**Papeleta de Ana Pérez:**
```
Socio: Juan Pérez
Carroza: Carroza B, Sitio: 3_p15  
Parientes: Ana Pérez  ← Solo la asignada
```

## Cambios Técnicos

### 1. Función `getAsignados()`
**Antes:**
```typescript
// Filtrar parientes que tienen asignaciones (sitios que contienen '_p')
const parientesAsignados = todosParientes.filter(pariente => 
  asignaciones.some(asignacion => 
    asignacion.socio_id === pariente.socio_id && asignacion.sitio.includes('_p')
  )
);
```

**Ahora:**
```typescript
// Filtrar parientes que tienen asignaciones específicas
const parientesAsignados = todosParientes.filter(pariente => 
  asignaciones.some(asignacion => 
    asignacion.socio_id === pariente.socio_id && 
    asignacion.sitio.includes('_p') &&
    asignacion.sitio.includes(`p${pariente.id}`)  ← Verificación específica
  )
);
```

### 2. Función `getPapeletasReales()`
**Antes:**
```typescript
// Es el socio principal
const parientesDelSocio = todosParientes.filter(p => p.socio_id === socio.id);
```

**Ahora:**
```typescript
// Es el socio principal
// Solo incluir parientes que también estén asignados a carrozas
const parientesAsignados = todosParientes.filter(pariente => {
  return asignaciones.some(asig => 
    asig.socio_id === socio.id && 
    asig.sitio.includes('_p') && 
    asig.sitio.includes(`p${pariente.id}`)
  );
});
```

## Formato de Sitios de Parientes

Los sitios de parientes siguen el formato: `{numero}_p{pariente_id}`

Ejemplos:
- `1_p15` → Sitio 1, Pariente ID 15
- `3_p16` → Sitio 3, Pariente ID 16  
- `5_p17` → Sitio 5, Pariente ID 17

## Verificación del Filtro

El nuevo filtro verifica tres condiciones:
1. `asignacion.socio_id === pariente.socio_id` → El pariente pertenece al socio
2. `asignacion.sitio.includes('_p')` → Es una asignación de pariente
3. `asignacion.sitio.includes(`p${pariente.id}`)` → **Es específicamente este pariente**

## Beneficios de la Corrección

### ✅ Precisión
- Las papeletas muestran exactamente quién está asignado
- No se incluyen parientes que no van en las carrozas

### ✅ Claridad
- Los organizadores saben exactamente quién debe ir en cada carroza
- Se evita confusión sobre quién está realmente asignado

### ✅ Consistencia
- La información en papeletas coincide con las asignaciones en Cortejos
- Datos coherentes en toda la aplicación

## Casos de Uso

### Familia Completa Asignada
Si Juan, Ana y Carlos están todos asignados:
- **Papeleta de Juan**: Mostrará Ana y Carlos como parientes
- **Papeleta de Ana**: Solo mostrará Ana
- **Papeleta de Carlos**: Solo mostrará Carlos

### Solo Algunos Parientes Asignados  
Si solo Juan y Ana están asignados:
- **Papeleta de Juan**: Solo mostrará Ana (no Carlos ni María)
- **Papeleta de Ana**: Solo mostrará Ana

### Solo Socio Principal
Si solo Juan está asignado:
- **Papeleta de Juan**: No mostrará ningún pariente
- No habrá papeletas para Ana, Carlos o María

Esta corrección asegura que las papeletas reflejen fielmente las asignaciones reales de la cabalgata.
