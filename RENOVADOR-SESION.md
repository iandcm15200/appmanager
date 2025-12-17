# 🔄 RENOVADOR AUTOMÁTICO DE SESIÓN

Mantiene la sesión de APManager activa automáticamente, renovándola cada 15 minutos.

## 🔐 Configuración Inicial (IMPORTANTE)

**Antes de usar el renovador, configura tus credenciales:**

```powershell
npx ts-node src/configurar-credenciales.ts
```

Esto creará el archivo `.credenciales.json` con tu email, contraseña e intervalo.

**Formato del archivo `.credenciales.json`:**
```json
{
  "email": "tu-email@aplatam.com",
  "password": "tu-contraseña",
  "intervaloMinutos": 15
}
```

⚠️ **Seguridad:** Este archivo NO se sube a Git (está en .gitignore)

---

## 🚀 Uso Rápido

### Opción 1: Ejecutar en Terminal (Recomendado para pruebas)

```powershell
npx ts-node src/renovar-sesion-auto.ts
```

**Ventajas:**
- Fácil de iniciar/detener (Ctrl+C)
- Ves los logs en tiempo real
- Ideal para pruebas

**Desventajas:**
- Debes dejar la terminal abierta
- Se detiene si cierras la terminal

---

### Opción 2: Ejecutar como Tarea Programada de Windows (Recomendado para producción)

Esto hace que el renovador se ejecute automáticamente al iniciar Windows y se mantenga en segundo plano.

#### Pasos:

1. **Abrir Programador de Tareas:**
   - Presiona `Win + R`
   - Escribe: `taskschd.msc`
   - Enter

2. **Crear Nueva Tarea:**
   - Click derecho en "Biblioteca del Programador de tareas"
   - "Crear tarea básica..."

3. **Configurar Tarea:**
   - **Nombre:** `APManager - Renovador de Sesión`
   - **Descripción:** `Renueva automáticamente la sesión de APManager cada 2 horas`
   - **Desencadenador:** "Al iniciar el equipo"
   - **Acción:** "Iniciar un programa"
   - **Programa:** `powershell.exe`
   - **Argumentos:** 
     ```
     -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Users\iandc\Desktop\apmanager-students-platform\iniciar-renovador.ps1"
     ```
   - **Iniciar en:** `C:\Users\iandc\Desktop\apmanager-students-platform`

4. **Configurar Opciones Avanzadas:**
   - ✅ Ejecutar aunque el usuario no haya iniciado sesión
   - ✅ Ejecutar con los privilegios más altos
   - ✅ Detener la tarea si se ejecuta más de: 3 días (opcional)

5. **Iniciar Tarea:**
   - Click derecho en la tarea → "Ejecutar"

---

## ⚙️ Configuración

### Cambiar Intervalo de Renovación

**Opción 1 (Recomendado):** Ejecuta el configurador

```powershell
npx ts-node src/configurar-credenciales.ts
```

**Opción 2:** Edita manualmente `.credenciales.json`

```json
{
  "email": "tu-email@aplatam.com",
  "password": "tu-contraseña",
  "intervaloMinutos": 10
}
```

### Cambiar Credenciales

Ejecuta el configurador y sigue las instrucciones:

```powershell
npx ts-node src/configurar-credenciales.ts
```

---

## 📊 Monitoreo

### Ver si está corriendo:

```powershell
# Ver procesos de Node.js
Get-Process node -ErrorAction SilentlyContinue
```

### Ver logs en tiempo real:

Si iniciaste con Opción 1, verás logs como:

```
[15/12/2025 20:30:00] Renovando sesión...
[15/12/2025 20:30:15] ✅ Sesión renovada exitosamente
⏰ Próxima renovación en 2 hora(s)...
```

---

## 🛑 Detener Renovador

### Si usaste Opción 1 (Terminal):
- Presiona `Ctrl + C` en la terminal

### Si usaste Opción 2 (Tarea Programada):
1. Abre Programador de Tareas (`taskschd.msc`)
2. Busca "APManager - Renovador de Sesión"
3. Click derecho → "Detener" o "Deshabilitar"

---

## 🔒 Seguridad

✅ **Protección implementada:**
- Las credenciales están en `.credenciales.json` (NO en el código)
- El archivo está en `.gitignore` (NO se sube a Git)
- Solo tú tienes acceso al archivo en tu computadora

**Recomendaciones adicionales:**
1. No compartas el archivo `.credenciales.json` con nadie
2. Cambia tu contraseña periódicamente
3. Si trabajas en equipo, cada persona debe configurar sus propias credenciales

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si falla una renovación?
- El renovador lo intentará de nuevo en la próxima ejecución programada
- Los logs mostrarán el error
- Las búsquedas seguirán funcionando mientras la sesión esté activa

### ¿Cuánto tiempo es válida la sesión?
- APManager expira las sesiones después de 2-4 horas de inactividad
- Por defecto renovamos cada 15 minutos (configurable)

### ¿Puedo tener varios renovadores corriendo?
- No es necesario, uno es suficiente
- Múltiples renovadores no causan problemas, pero gastan recursos

---

## 🆘 Solución de Problemas

### Error: "Session expired"
- Verifica que las credenciales sean correctas
- Ejecuta manualmente: `npx ts-node src/login-auto.ts`

### Error: "Cannot find module"
- Ejecuta: `npm install`

### El renovador se detiene solo
- Verifica que la tarea programada esté configurada correctamente
- Revisa los logs de Windows Event Viewer

---

## 📝 Notas

- El renovador usa **Playwright** en modo headless (sin ventana visible)
- Consume ~50-100 MB de RAM mientras está activo
- Cada renovación toma ~15-20 segundos
- No interfiere con las búsquedas normales
