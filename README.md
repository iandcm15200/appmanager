# APManager Students Platform

Plataforma de búsqueda instantánea de estudiantes con BD SQLite local y enlace directo a APManager.

## Características

- Búsqueda instantánea: **0ms** (caché local)
- Enlace directo a APManager automático
- Base de datos: **2,454** estudiantes
- Código limpio y optimizado
- Importación inteligente con auto-detección de tipos

## 📦 Estructura

```
src/
  ├── database.ts              # Gestión SQLite
  ├── buscar-con-cache.ts      # Búsqueda + enlace
  ├── importar-inteligente.ts  # Importar Excel
  ├── consultar-bd-v2.ts       # Consultas avanzadas
  ├── config.ts                # Configuración
  ├── utils.ts                 # Utilidades
  ├── cliente.ts               # Cliente HTTP
  └── 1-login-manual.ts        # Login manual

dist/                          # Compilado (generado)
estudiantes.db                 # BD SQLite (2,454 registros)
```

## 📋 Requisitos

```bash
npm install xlsx better-sqlite3 @types/better-sqlite3
```

## Comandos Principales

### Búsqueda Inteligente (RECOMENDADO)

```bash
npx ts-node src/buscar.ts "email@example.com"
```

**Flujo automático:**
- Paso 1: Busca en caché (0ms)
- Paso 2: Si no encuentra → busca en APManager (~77seg)
- Paso 3: Si encuentra → guarda automáticamente en BD

**Ejemplo:**
```bash
npx ts-node src/buscar.ts "machi2595@gmail.com"
```

Resultado:
```
Lead ID:   MACHI2595
Nombre:    Cameross Caile Maria
Programa:  MAESTRIA
Matrícula: 2511/2025

Enlace APManager:
https://apmanager.aplatam.com/admin/Ventas/Consulta/Lead/MACHI2595
```

### Búsqueda por Email (Caché)

```bash
npx ts-node src/buscar-con-cache.ts "tc.diana@hotmail.com"
```

**Salida:**
```
Lead ID:  2516407
Nombre:   Diana
Email:    tc.diana@hotmail.com
Programa: MAESTRIA
URL:      https://apmanager.aplatam.com/admin/Ventas/Consulta/Lead/2516407
Tiempo:   0ms
```

### Búsqueda Híbrida (Caché + APManager)

```bash
npx ts-node src/buscar-hibrido.ts "email@example.com"
```

**Flujo:**
1. ⚡ Busca en caché (0ms)
2. Si no encuentra → busca en APManager (77seg)
3. Si encuentra → **guarda automáticamente en caché**
4. Próxima búsqueda: 0ms

**Ejemplo:**
```bash
npx ts-node src/buscar-hibrido.ts "nuevo@email.com" "MAESTRIA"
```

## Base de Datos

```bash
npx ts-node src/consultar-bd-v2.ts --programa MAESTRIA
npx ts-node src/consultar-bd-v2.ts --programa DIPLOMADO
npx ts-node src/consultar-bd-v2.ts --programa MASTER
```

### Búsqueda por Lead ID

```bash
npx ts-node src/consultar-bd-v2.ts --lead-id "2516407"
```

### Búsqueda por Nombre

```bash
npx ts-node src/consultar-bd-v2.ts --nombre "Diana"
```

### Importar Nuevos Excel

```bash
npx ts-node src/importar-inteligente.ts "ruta/carpeta/excel"
```

Detecta automáticamente:
- **DIPLOMADO**
- **MAESTRIA**
- **MASTER**
- **UDLA-UVA**

## Modos de Búsqueda

### Modo 1: Caché (Recomendado)
```bash
npx ts-node src/buscar-con-cache.ts "email@example.com"
```
- Tiempo: **0ms**
- Fuente: BD local SQLite
- Ideal: Búsquedas rápidas

### Modo 2: Híbrido (Inteligente)
```bash
npx ts-node src/buscar-hibrido.ts "email@example.com"
```
- Si en caché: **0ms**
- Si no: **77seg** (busca APManager)
- Guarda automáticamente
- Ideal: Primera búsqueda de nuevo estudiante

### Modo 3: Consultas Avanzadas
```bash
npx ts-node src/consultar-bd-v2.ts --programa MAESTRIA
npx ts-node src/consultar-bd-v2.ts --nombre "Diana"
npx ts-node src/consultar-bd-v2.ts --stats
```
- Listados completos
- Búsquedas avanzadas
- Estadísticas

## Administración de BD


### Importar Nuevos Excel

## Base de Datos

### Estructura

```sql
CREATE TABLE estudiantes (
  lead_id TEXT NOT NULL,
  programa TEXT NOT NULL,
  email TEXT,
  nombre TEXT,
  matricula TEXT,
  estado TEXT,
  fuente TEXT,
  fecha_importacion DATETIME,
  PRIMARY KEY (lead_id, programa)
);
```

### Datos Actuales

| Programa | Cantidad |
|----------|----------|
| MAESTRIA | 1,675 |
| MASTER | 497 |
| DIPLOMADO | 271 |
| Otros | 11 |
| **TOTAL** | **2,454** |

## Rendimiento

| Operación | Tiempo |
|-----------|--------|
| Búsqueda en caché | 0-1ms |
| Importación (2,454 reg) | ~5seg |
| Estadísticas | 1ms |

## Desarrollo

### Compilar TypeScript

```bash
npm run build
```

### Archivos Creados

- `database.ts` - 230 líneas (optimizado)
- `buscar-con-cache.ts` - 60 líneas
- `consultar-bd-v2.ts` - 140 líneas
- `importar-inteligente.ts` - 220 líneas

### Código Limpio

[✓] Funciones puras sin efectos secundarios  
[✓] Nombres descriptivos  
[✓] Comentarios mínimos y precisos  
[✓] Sin código muerto  
[✓] Manejo de errores explícito  

## Ejemplos

### Ejemplo 1: Búsqueda Rápida (Caché)
```bash
npx ts-node src/buscar-con-cache.ts "student@email.com"
# Resultado: 0ms
```

### Ejemplo 2: Búsqueda Inteligente (Caché + APManager)
```bash
npx ts-node src/buscar-hibrido.ts "nuevostudiante@email.com"
# Si está en caché: 0ms
# Si no: busca en APManager (77seg) y guarda automáticamente
# Próxima búsqueda: 0ms
```

### Ejemplo 3: Listar Maestrías
```bash
npx ts-node src/consultar-bd-v2.ts --programa MAESTRIA | head -20
```

### Ejemplo 4: Auditoría de BD
```bash
npx ts-node src/consultar-bd-v2.ts --stats
```

## 🔐 Seguridad

- BD local (sin exposición a red)
- Validación de emails
- Prevención de duplicados
- Timestamps automáticos

## 📞 Soporte

Verifica que existan:
- `estudiantes.db` (BD SQLite)
- Dependencias instaladas: `npm install`
- Formato Excel: lead_id + programa

---

**Estado:** ✅ Producción  
**Última actualización:** 15 de diciembre de 2025  
**Licencia:** MIT

