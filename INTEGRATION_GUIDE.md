# 🎯 Guía Completa de Integración - Sweeppea N8N Node

## 📖 Tabla de Contenidos

1. [¿Qué es esta integración?](#qué-es-esta-integración)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flujo Completo Paso a Paso](#flujo-completo-paso-a-paso)
4. [Endpoints de la API](#endpoints-de-la-api)
5. [Cómo Funciona el Nodo](#cómo-funciona-el-nodo)
6. [Guía de Pruebas](#guía-de-pruebas)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 ¿Qué es esta integración?

Esta integración permite que **N8N** (una herramienta de automatización) pueda crear participantes en sorteos de **Sweeppea** de manera inteligente y dinámica.

### ¿Por qué es útil?

Imagina que un usuario te escribe por **WhatsApp** diciendo "Quiero participar en el sorteo". Un bot con IA:
1. Le pregunta qué sorteo quiere
2. **Automáticamente consulta** qué campos necesita ese sorteo específico
3. **Le pregunta al usuario** cada campo necesario de manera conversacional
4. Cuando tiene todos los datos, **crea el participante automáticamente**
5. Le confirma su número de participación

**SIN** esta integración: Tendrías que programar manualmente cada sorteo con sus campos específicos.
**CON** esta integración: Un solo workflow funciona para TODOS los sorteos, porque se adapta dinámicamente.

### 💡 Ejemplo Real

**Usuario:** "Hola, quiero participar"
**Bot:** "¡Genial! ¿En qué sorteo quieres participar?"
**Usuario:** "Summer Giveaway 2025"
**Bot:** *(consulta automáticamente qué campos necesita)* "Perfecto. Necesito algunos datos. ¿Cuál es tu email?"
**Usuario:** "juan@example.com"
**Bot:** "¿Tu nombre?"
**Usuario:** "Juan"
**Bot:** "¿Tu apellido?"
**Usuario:** "Pérez"
**Bot:** "¿Tu edad?"
**Usuario:** "28"
**Bot:** "¿De qué país eres?"
**Usuario:** "Argentina"
**Bot:** *(crea el participante automáticamente)* "¡Listo Juan! Estás registrado en Summer Giveaway 2025 con el número SUMMER_2025-000042"

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐
│   WhatsApp      │
│   (Usuario)     │
└────────┬────────┘
         │ "Quiero participar"
         ▼
┌─────────────────┐
│   IA/ChatBot    │
│   (OpenAI, etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      N8N        │
│   (Workflow)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sweeppea Node  │ ◄── Este es nuestro código
└────────┬────────┘
         │ 1. Consulta schema
         │ 2. Crea participante
         ▼
┌─────────────────┐
│  Sweeppea API   │
│   (Backend)     │
└─────────────────┘
```

### Componentes:

1. **Mock Server** (`mock-server/server.js`)
   - Servidor de prueba que simula la API real de Sweeppea
   - Solo para desarrollo y testing
   - Corre en `http://localhost:3002`

2. **Credentials** (`credentials/SweeppeaApi.credentials.ts`)
   - Maneja la autenticación
   - Permite elegir ambiente (Production, Staging, Development)

3. **Node** (`nodes/Sweeppea/Sweeppea.node.ts`)
   - El nodo que ves en N8N
   - Hace toda la lógica de comunicación con la API

---

## 🔄 Flujo Completo Paso a Paso

### Escenario Real: Usuario conversa por WhatsApp para participar en "Summer Giveaway 2025"

#### **PASO 1: Usuario inicia conversación por WhatsApp**

**Usuario escribe:**
```
"Hola, quiero participar en Summer Giveaway 2025"
```

El mensaje llega a N8N a través de un webhook de WhatsApp (o Evolution API, etc.)

#### **PASO 2: IA/Bot consulta qué campos necesita el sorteo**

Antes de preguntarle NADA al usuario, el bot necesita saber qué campos pedir. Aquí es donde usamos nuestro nodo.

**El workflow de N8N:**
1. Recibe el mensaje "Quiero participar en Summer Giveaway 2025"
2. Identifica que el sorteo es `summer_2025`
3. **Usa el nodo Sweeppea solo para CONSULTAR el schema** (no para crear todavía)

**Configuración temporal del nodo para consulta:**
- **Sweepstake ID**: `summer_2025`
- **Credentials**: Configuradas
- Solo queremos el schema, no crear participante aún

> **IMPORTANTE:** En este paso NO creamos el participante. Solo consultamos qué campos necesitamos.

#### **PASO 3: N8N/Workflow consulta el schema del sorteo**

**¿Por qué?** Porque necesitamos saber qué preguntarle al usuario.

N8N hace una petición HTTP (no necesitas el nodo de Sweeppea para esto, es solo un HTTP Request):

**REQUEST:**
```http
GET /api-v1/n8n/sweepstakes/summer_2025/schema
Authorization: Bearer sk_test_mock123456789
```

**RESPONSE:**
```json
{
  "success": true,
  "sweepstakeId": "summer_2025",
  "name": "Summer Mega Giveaway 2025",
  "fields": [
    { "name": "email", "displayName": "Email Address", "required": true },
    { "name": "firstName", "displayName": "First Name", "required": true },
    { "name": "lastName", "displayName": "Last Name", "required": true },
    { "name": "age", "displayName": "Age", "required": true },
    { "name": "country", "displayName": "Country", "required": true },
    { "name": "newsletter", "displayName": "Subscribe to Newsletter", "required": false }
  ]
}
```

#### **PASO 4: IA/Bot interpreta el schema y comienza conversación**

La IA ahora sabe que necesita 5 campos required: email, firstName, lastName, age, country.

**Bot responde al usuario por WhatsApp:**
```
"¡Perfecto Juan! Para registrarte en Summer Giveaway 2025, necesito algunos datos.
¿Cuál es tu email?"
```

#### **PASO 5: Usuario responde los campos uno por uno**

**Conversación:**

```
Bot: "¿Cuál es tu email?"
Usuario: "juan@example.com"

Bot: "¿Tu nombre?"
Usuario: "Juan"

Bot: "¿Tu apellido?"
Usuario: "Pérez"

Bot: "¿Tu edad?"
Usuario: "28"

Bot: "¿De qué país eres?"
Usuario: "Argentina"

Bot: "¿Quieres recibir nuestro newsletter? (opcional)"
Usuario: "Sí"
```

**El workflow de N8N va guardando cada respuesta** en variables o en una base de datos temporal.

#### **PASO 6: Cuando se tienen TODOS los datos, se crea el participante**

Ahora SÍ usamos el **nodo de Sweeppea** para crear el participante.

**El workflow envía a nuestro nodo:**
```json
{
  "sweepstakeId": "summer_2025",
  "email": "juan@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "age": 28,
  "country": "Argentina",
  "newsletter": true
}
```

**El nodo de Sweeppea:**
1. Valida que todos los campos requeridos estén presentes
2. Hace el POST a la API:

```http
POST /api-v1/n8n/participants
{
  "sweepstakeId": "summer_2025",
  "data": {
    "email": "juan@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "age": 28,
    "country": "Argentina",
    "newsletter": true
  }
}
```

**API responde:**
```json
{
  "success": true,
  "participantId": "part_1760407343582_7bpj87",
  "entryNumber": "SUMMER_2025-000042",
  "createdAt": "2025-10-14T02:02:23.582Z"
}
```

#### **PASO 7: Bot confirma al usuario**

**Bot envía mensaje final por WhatsApp:**
```
"¡Listo Juan! 🎉

Estás registrado en Summer Giveaway 2025
Tu número de participación es: SUMMER_2025-000042

¡Mucha suerte! 🍀"
```

### 🎯 ¿Por qué este flujo es PERFECTO?

1. ✅ **Dinámico**: Si mañana creas un sorteo con otros campos, el mismo workflow funciona
2. ✅ **Conversacional**: El usuario no llena formularios aburridos
3. ✅ **Inteligente**: La IA puede validar respuestas y pedir aclaraciones
4. ✅ **Flexible**: Funciona con WhatsApp, Telegram, Discord, cualquier chat
5. ✅ **Escalable**: Un solo bot atiende TODOS tus sorteos

---

## 🔌 Endpoints de la API

### 1. **GET Schema** - Obtener campos del sorteo

**Endpoint:** `GET /api-v1/n8n/sweepstakes/:sweepstakeId/schema`

**Propósito:** Saber qué campos necesitas enviar para crear un participante en ese sorteo específico.

**Headers:**
```
Authorization: Bearer sk_test_mock123456789
```

**Ejemplo de uso:**
```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/n8n/sweepstakes/summer_2025/schema
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "sweepstakeId": "summer_2025",
  "name": "Summer Mega Giveaway 2025",
  "fields": [...]
}
```

**Errores posibles:**

| Código | Error | Razón |
|--------|-------|-------|
| 401 | Unauthorized | API key inválida o faltante |
| 404 | Not Found | El sweepstakeId no existe |

---

### 2. **POST Participant** - Crear participante

**Endpoint:** `POST /api-v1/n8n/participants`

**Propósito:** Crear un nuevo participante en un sorteo.

**Headers:**
```
Authorization: Bearer sk_test_mock123456789
Content-Type: application/json
```

**Body:**
```json
{
  "sweepstakeId": "summer_2025",
  "data": {
    "email": "usuario@example.com",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "age": 25,
    "country": "Argentina",
    "newsletter": true
  }
}
```

**Ejemplo de uso:**
```bash
curl -X POST http://localhost:3002/api-v1/n8n/participants \
  -H "Authorization: Bearer sk_test_mock123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "sweepstakeId": "summer_2025",
    "data": {
      "email": "test@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "age": 25,
      "country": "Argentina"
    }
  }'
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "participantId": "part_1760407343582_7bpj87",
  "entryNumber": "SUMMER_2025-000001",
  "createdAt": "2025-10-14T02:02:23.582Z",
  "data": {...}
}
```

**Errores posibles:**

| Código | Error | Razón | Solución |
|--------|-------|-------|----------|
| 400 | Validation Failed | Falta un campo requerido o validación falló | Verificar que todos los campos required estén presentes |
| 404 | Not Found | El sweepstakeId no existe | Usar un sweepstakeId válido |
| 409 | Conflict | Email duplicado | El email ya participó en este sorteo |

**Ejemplo de error 400:**
```json
{
  "success": false,
  "error": "Validation Failed",
  "message": "One or more fields failed validation",
  "errors": [
    "Field 'email' is required",
    "Field 'age' must be at least 18"
  ]
}
```

---

### 3. **Endpoints de Debug** (Solo para desarrollo)

#### GET Health Check
```bash
curl http://localhost:3002/health
```

Respuesta:
```json
{
  "success": true,
  "status": "healthy",
  "message": "Sweeppea Mock API Server is running"
}
```

#### GET All Participants
```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/debug/participants
```

#### GET All Sweepstakes
```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/debug/sweepstakes
```

---

## 🎮 Cómo Funciona el Nodo

### Configuración del Nodo en N8N

Cuando agregas el nodo "Sweeppea" en N8N, verás estas opciones:

1. **Credentials** (Requerido)
   - Aquí seleccionas las credenciales configuradas previamente

2. **Sweepstake ID** (Requerido)
   - El ID del sorteo (ej: `summer_2025`, `holiday_special`)

3. **Use Input Data** (Opcional, default: true)
   - Si está en `true`: El nodo toma TODOS los datos del nodo anterior
   - Si está en `false`: Tendrías que mapear campos manualmente (no implementado aún)

### ¿Qué hace el nodo internamente?

```javascript
// PASO 1: Obtener credenciales y configuración
const sweepstakeId = "summer_2025";  // Lo que configuraste
const credentials = {...};            // API key y ambiente

// PASO 2: Construir URL base según ambiente
if (ambiente === 'production') {
  baseUrl = 'https://api.sweeppea.com';
} else if (ambiente === 'staging') {
  baseUrl = 'https://staging-api.sweeppea.com';
} else {
  baseUrl = 'http://localhost:3002';  // Development
}

// PASO 3: Pedir schema
const schema = await fetch(
  `${baseUrl}/api-v1/n8n/sweepstakes/${sweepstakeId}/schema`
);

// PASO 4: Mapear datos del input
const inputData = {...};  // Datos del nodo anterior
const participantData = {};

for (const field of schema.fields) {
  if (inputData[field.name]) {
    participantData[field.name] = inputData[field.name];
  }
}

// PASO 5: Validar campos requeridos
for (const field of schema.fields) {
  if (field.required && !participantData[field.name]) {
    throw new Error(`Campo ${field.name} es requerido`);
  }
}

// PASO 6: Crear participante
const result = await fetch(
  `${baseUrl}/api-v1/n8n/participants`,
  {
    method: 'POST',
    body: {
      sweepstakeId: sweepstakeId,
      data: participantData
    }
  }
);

// PASO 7: Retornar resultado al workflow
return result;
```

---

## 🧪 Guía de Pruebas

### Pre-requisitos

1. **Node.js instalado** (v16 o superior)
2. **Git instalado**
3. **N8N instalado** (localmente o en cloud)

### Paso 1: Iniciar el Mock Server

```bash
# En terminal 1
cd mock-server
node server.js
```

**Deberías ver:**
```
🚀 Sweeppea Mock API Server
📡 Running on: http://localhost:3002
🔑 Test API Key: sk_test_mock123456789

📚 Available endpoints:
   GET  /health
   GET  /api-v1/n8n/sweepstakes/:sweepstakeId/schema
   POST /api-v1/n8n/participants
   GET  /api-v1/debug/participants
   GET  /api-v1/debug/sweepstakes

✨ Ready to accept requests!
```

### Paso 2: Probar Endpoints Directamente

**Test 1: Health Check**
```bash
curl http://localhost:3002/health
```

Debe retornar:
```json
{"success":true,"status":"healthy",...}
```

**Test 2: Obtener Schema**
```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/n8n/sweepstakes/summer_2025/schema
```

Debe retornar el schema con los campos.

**Test 3: Crear Participante**
```bash
curl -X POST http://localhost:3002/api-v1/n8n/participants \
  -H "Authorization: Bearer sk_test_mock123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "sweepstakeId": "summer_2025",
    "data": {
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "age": 25,
      "country": "United States"
    }
  }'
```

Debe retornar:
```json
{
  "success": true,
  "participantId": "part_...",
  "entryNumber": "SUMMER_2025-000001",
  ...
}
```

**Test 4: Verificar Participante Creado**
```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/debug/participants
```

Deberías ver el participante que acabas de crear.

**Test 5: Probar Email Duplicado**

Ejecuta el Test 3 nuevamente (mismo email). Debe retornar error 409:
```json
{
  "success": false,
  "error": "Conflict",
  "message": "A participant with email 'test@example.com' already exists..."
}
```

### Paso 3: Configurar N8N

#### 3.1 Enlazar el nodo con N8N

```bash
# En la raíz del proyecto
npm link

# En tu instalación de N8N
cd ~/.n8n/custom
npm link n8n-nodes-sweeppea
```

#### 3.2 Reiniciar N8N

```bash
# Si tienes N8N corriendo localmente
n8n start
```

#### 3.3 Crear Credenciales en N8N

1. Ve a **Settings** → **Credentials**
2. Click en **Add Credential**
3. Busca "Sweeppea API"
4. Configura:
   - **Environment:** Development
   - **API Key:** `sk_test_mock123456789`
   - **Custom API URL:** `http://localhost:3002`
5. Click en **Test** → Debe decir "Connection successful"
6. Guarda

### Paso 4: Crear Workflow de Prueba

#### 4.1 Workflow Simple

1. Crea un nuevo workflow
2. Agrega nodo **"Manual"** (trigger manual)
3. Agrega nodo **"Set"** para simular datos:
   ```json
   {
     "email": "workflow@example.com",
     "firstName": "Workflow",
     "lastName": "Test",
     "age": 30,
     "country": "Canada",
     "newsletter": true
   }
   ```
4. Agrega nodo **"Sweeppea"**:
   - Credentials: Selecciona las que creaste
   - Sweepstake ID: `summer_2025`
5. Conecta: Manual → Set → Sweeppea
6. Click en **Execute Workflow**

**Resultado esperado:**
```json
{
  "success": true,
  "participantId": "part_...",
  "sweepstakeId": "summer_2025",
  "entryNumber": "SUMMER_2025-000002",
  "data": {
    "email": "workflow@example.com",
    ...
  }
}
```

#### 4.2 Workflow con Formulario Web

1. Agrega nodo **"Webhook"** como trigger
2. Agrega nodo **"Sweeppea"**
3. Conecta: Webhook → Sweeppea
4. Activa el workflow
5. Copia la URL del webhook
6. Envía datos vía POST:

```bash
curl -X POST https://tu-n8n.com/webhook/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "webhook@example.com",
    "firstName": "Webhook",
    "lastName": "Test",
    "age": 28,
    "country": "Mexico"
  }'
```

### Paso 5: Probar Diferentes Sorteos

El mock server tiene 2 sorteos configurados:

**summer_2025:**
- Campos: email, firstName, lastName, phone, age, country, newsletter

**holiday_special:**
- Campos: email, fullName, favoriteHoliday

Prueba crear participantes para ambos:

```bash
# Holiday Special
curl -X POST http://localhost:3002/api-v1/n8n/participants \
  -H "Authorization: Bearer sk_test_mock123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "sweepstakeId": "holiday_special",
    "data": {
      "email": "holiday@example.com",
      "fullName": "Holiday User",
      "favoriteHoliday": "Christmas"
    }
  }'
```

### Paso 6: Probar Validaciones

**Test: Campo Requerido Faltante**
```bash
curl -X POST http://localhost:3002/api-v1/n8n/participants \
  -H "Authorization: Bearer sk_test_mock123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "sweepstakeId": "summer_2025",
    "data": {
      "email": "incomplete@example.com"
    }
  }'
```

Debe retornar error 400 indicando qué campos faltan.

**Test: Email Inválido**
```bash
curl -X POST http://localhost:3002/api-v1/n8n/participants \
  -H "Authorization: Bearer sk_test_mock123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "sweepstakeId": "summer_2025",
    "data": {
      "email": "not-an-email",
      "firstName": "Test",
      "lastName": "User",
      "age": 25,
      "country": "Canada"
    }
  }'
```

Debe retornar error 400 indicando que el email es inválido.

**Test: Edad Fuera de Rango**
```bash
curl -X POST http://localhost:3002/api-v1/n8n/participants \
  -H "Authorization: Bearer sk_test_mock123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "sweepstakeId": "summer_2025",
    "data": {
      "email": "young@example.com",
      "firstName": "Too",
      "lastName": "Young",
      "age": 15,
      "country": "USA"
    }
  }'
```

Debe retornar error 400 indicando que la edad debe ser al menos 18.

---

## ❓ Preguntas Frecuentes

### ¿Cuál es la diferencia entre el mock server y la API real?

**Mock Server:**
- Servidor de prueba que corre localmente
- Solo para desarrollo
- Datos se guardan en memoria (se pierden al reiniciar)
- URL: `http://localhost:3002`

**API Real:**
- Servidor de producción de Sweeppea
- Datos reales que se guardan en base de datos
- URL: `https://api.sweeppea.com`

### ¿Qué es un sweepstakeId?

Es un identificador único de cada sorteo en Sweeppea. Por ejemplo:
- `summer_2025` → Summer Giveaway 2025
- `holiday_special` → Holiday Special Giveaway
- `black_friday_2025` → Black Friday Giveaway

Cada sorteo puede tener campos diferentes.

### ¿Por qué necesito llamar primero al endpoint de schema?

Porque **cada sorteo puede tener campos diferentes**. El schema te dice:
- Qué campos necesitas enviar
- Cuáles son obligatorios
- Qué tipo de dato espera (string, number, boolean, etc.)
- Qué validaciones aplican

**Sin schema:** No sabrías qué enviar
**Con schema:** Sabes exactamente qué necesitas

### ¿Qué pasa si envío un campo que no está en el schema?

El campo extra se ignora. Solo se procesan los campos definidos en el schema.

### ¿Qué pasa si NO envío un campo requerido?

Recibes un error 400 con el mensaje indicando qué campos faltan.

### ¿Puedo crear el mismo participante dos veces?

No. Si intentas crear un participante con un email que ya existe en ese sorteo, recibes error 409 (Conflict).

### ¿Cómo sé si mi participante se creó exitosamente?

La respuesta tiene `"success": true` y te da:
- `participantId`: ID único del participante
- `entryNumber`: Número de entrada (ej: "SUMMER_2025-000001")
- `createdAt`: Fecha/hora de creación

### ¿Qué ambientes hay disponibles?

1. **Development:** `http://localhost:3002` (mock server)
2. **Staging:** `https://staging-api.sweeppea.com` (cuando esté disponible)
3. **Production:** `https://api.sweeppea.com` (cuando esté disponible)

### ¿Cómo cambio de ambiente?

En las credenciales de N8N:
1. Ve a Settings → Credentials
2. Edita las credenciales de Sweeppea
3. Cambia el campo "Environment"

### ¿El nodo funciona con múltiples items?

Sí! Si el nodo anterior retorna 10 items, el nodo de Sweeppea procesa los 10 automáticamente, creando 10 participantes.

### ¿Qué pasa si uno de los 10 items falla?

Depende de la configuración "Continue on Fail":
- **Si está activado:** Procesa los demás items y marca el fallido con error
- **Si está desactivado:** Se detiene en el primer error

### ¿Cómo puedo ver todos los participantes creados?

```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/debug/participants
```

### ¿Cómo reseteo el mock server?

Simplemente reinícialo:
```bash
# Ctrl+C para detener
# Luego:
node server.js
```

Todos los participantes creados se pierden (es solo para pruebas).

---

## 🎓 Explicación para tus Compañeros

Aquí hay un script que puedes usar para explicar la integración:

---

**"Chicos, les explico cómo funciona esto:"**

**1. El Problema:**
Antes, si alguien llenaba un formulario para participar en un sorteo, teníamos que crear el participante manualmente. Imagínate hacerlo 1000 veces al día.

**2. La Solución:**
Ahora tenemos un nodo personalizado en N8N que hace todo automáticamente.

**3. ¿Cómo Funciona?**

Imaginen que tienen un sorteo llamado "Summer 2025" donde pedimos: email, nombre, apellido y edad.

**Paso A:** Un usuario llena el formulario
**Paso B:** Los datos llegan a N8N
**Paso C:** Nuestro nodo le pregunta a Sweeppea: "Oye, ¿qué campos necesitas para Summer 2025?"
**Paso D:** Sweeppea responde: "Necesito email, nombre, apellido y edad"
**Paso E:** Nuestro nodo toma los datos del formulario y los envía a Sweeppea
**Paso F:** Sweeppea crea el participante y nos da un número de entrada

**4. ¿Por qué es dinámico?**

Porque si mañana creamos un nuevo sorteo "Black Friday" que solo pida email y nombre, el mismo nodo funciona. Él pregunta qué campos necesita y se adapta.

**5. ¿Qué hicimos nosotros?**

Creamos:
- Un nodo para N8N
- Un sistema de credenciales para conectarse
- Un servidor de pruebas (mock) para hacer tests sin tocar producción

**6. ¿Qué pueden probar?**

Les voy a mostrar en vivo cómo:
- Iniciar el servidor de pruebas
- Crear un workflow en N8N
- Simular que alguien llena un formulario
- Ver cómo se crea el participante automáticamente

---

## 📝 Notas Finales

- El mock server tiene 2 sorteos de ejemplo: `summer_2025` y `holiday_special`
- La API key de prueba es: `sk_test_mock123456789`
- Los datos se guardan en memoria, se pierden al reiniciar el server
- Para producción, solo cambias el ambiente en las credenciales

**¿Tienes dudas?** Revisa esta guía o contacta al equipo de desarrollo.

---

**Última actualización:** 2025-10-14
**Versión:** 1.0
**Autor:** Sweeppea Development Lab
