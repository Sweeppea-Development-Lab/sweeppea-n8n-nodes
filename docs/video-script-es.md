# Sweeppea N8N Node - Libreto Completo del Video Demo

**Duracion:** ~4 minutos
**Formato:** Grabacion de pantalla SIN cortes (una sola toma)
**Herramienta:** Loom

---

## CHECKLIST PRE-GRABACION

Antes de empezar a grabar, tener listo:

- [ ] N8N corriendo (sin el nodo Sweeppea instalado)
- [ ] Terminal abierta
- [ ] Archivo JSON del workflow listo para importar: `examples/sweeppea-create-participant.json`
- [ ] API Token copiado en portapapeles
- [ ] Sweepstakes Token a mano
- [ ] Navegador limpio (sin tabs innecesarios)

### Datos que vas a necesitar:

```
API Token:          dbb6fb5a-24e2-4dda-b1f5-02a28468dac8
Sweepstakes Token:  965a7edb-1f46-4116-a394-9c8a63769284
```

### Comando de instalacion:

```bash
cd ~/.n8n/custom && npm init -y && npm install n8n-nodes-sweeppea
```

---

## PARTE 1: INSTALACION (30 seg)

### Accion:
1. Mostrar Terminal
2. Ejecutar:
   ```bash
   cd ~/.n8n/custom && npm init -y && npm install n8n-nodes-sweeppea
   ```
3. Esperar que termine
4. Reiniciar N8N (cerrar y abrir, o `n8n start`)
5. En N8N, abrir panel de nodos y buscar "Sweeppea"
6. Mostrar que aparece el nodo Sweeppea

**Texto en pantalla:** "Installing Sweeppea Node from npm"

---

## PARTE 2: CONFIGURAR CREDENCIALES (45 seg)

### Accion:
1. Click en **Settings** (engranaje arriba a la derecha)
2. Click en **Credentials**
3. Click en **Add Credential**
4. Buscar "Sweeppea" en el buscador
5. Click en **Sweeppea API**
6. En **Environment**: dejar "Production"
7. En **API Token**: pegar el token

```
dbb6fb5a-24e2-4dda-b1f5-02a28468dac8
```

8. Click en boton **Test**
9. Esperar checkmark verde (conexion exitosa)
10. Click en **Save**

**Texto en pantalla:** "Setting Up API Credentials"

---

## PARTE 3: IMPORTAR Y MOSTRAR WORKFLOW (1 min 30 seg)

### Accion:
1. Click en **Workflows** (menu lateral)
2. Click en **Add Workflow** o **+**
3. Click en menu **...** (tres puntos arriba)
4. Click en **Import from File**
5. Seleccionar archivo: `examples/sweeppea-create-participant.json`
6. Workflow se importa con todos los nodos

**Texto en pantalla:** "Importing Pre-built AI Chatbot Workflow"

### Recorrer cada nodo (click en cada uno y mostrar config):

**Nodo 1 - Chat Trigger:**
- Mostrar que esta configurado como publico
- Mostrar la URL del chat

**Nodo 2 - AI Agent:**
- Mostrar el System Prompt:

```
You are a friendly assistant helping users register for a sweepstake.

When you have ALL the required data from the user, respond ONLY with a JSON object.

Required fields:
- First_Name
- Last_Name
- Email
- Mobile_Number (10 digits, US format)

When you have ALL the data, respond with this EXACT JSON format:

{
  "action": "create_participant",
  "First_Name": "John",
  "Last_Name": "Doe",
  "Email": "user@example.com",
  "Mobile_Number": "1234567890"
}

Important:
- Ask for ONE field at a time in a conversational way
- Be friendly and engaging
- Validate email format
- Phone must be 10 digits
- When you have ALL the data, respond ONLY with the JSON (no additional text)
```

**Nodo 3 - Google Gemini:**
- Mostrar que esta conectado al AI Agent

**Nodo 4 - Simple Memory:**
- Mostrar configuracion de sesion

**Nodo 5 - Switch:**
- Mostrar condicion: detecta "create_participant"

**Nodo 6 - Code (Transform):**
- Mostrar brevemente que transforma la respuesta AI al formato API

**Nodo 7 - Sweeppea (IMPORTANTE):**
- Click en el nodo
- Mostrar **Resource**: Participant
- Mostrar **Operation**: Create
- En **Sweepstakes Token**: pegar:

```
965a7edb-1f46-4116-a394-9c8a63769284
```

- En **Credentials**: seleccionar "Sweeppea API" (la que creamos antes)

**Nodo 8 - Chat Response:**
- Mostrar mensaje de confirmacion

**Texto en pantalla:** "Configuring Sweeppea Node - Create Participant"

### Activar workflow:
1. Click en toggle **Active** (arriba a la derecha)
2. Confirmar que esta activo

---

## PARTE 4: DEMO EN VIVO (1 min)

### Accion:
1. Click en **Chat Trigger** node
2. Click en **Open Chat** o copiar URL del chat
3. Abrir el chat en nueva pestana

**Texto en pantalla:** "Live Demo - AI Chatbot Registration"

### Conversacion (escribir en el chat):

| Paso | Bot dice | Tu escribes |
|------|----------|-------------|
| 1 | "Hi! I'll help you register..." | - |
| 2 | "What's your first name?" | `John` |
| 3 | "Great! And your last name?" | `Smith` |
| 4 | "What's your email?" | `john@example.com` |
| 5 | "Finally, your phone number?" | `5551234567` |
| 6 | "Thank you for participating!" | - |

4. Volver a N8N
5. Click en **Executions** (menu lateral)
6. Mostrar la ejecucion exitosa
7. Click en la ejecucion para ver los datos enviados

**Texto en pantalla:** "Participant Successfully Created"

---

## PARTE 5: CIERRE (15 seg)

### Accion:
1. Volver al workflow
2. Mostrar el flujo completo una vez mas

**Texto en pantalla (final):**

```
Sweeppea N8N Community Node

npm install n8n-nodes-sweeppea

Documentation: apidocs.sweeppea.com
GitHub: github.com/Sweeppea-Development-Lab/sweeppea-n8n-nodes
```

---

## RESUMEN DE TIEMPOS

| Parte | Duracion | Acumulado |
|-------|----------|-----------|
| 1. Instalacion | 30 seg | 0:30 |
| 2. Credenciales | 45 seg | 1:15 |
| 3. Workflow | 1:30 min | 2:45 |
| 4. Demo | 1:00 min | 3:45 |
| 5. Cierre | 15 seg | 4:00 |

**Total: ~4 minutos**

---

## TIPS DURANTE LA GRABACION

1. **Mueve el mouse lento** - Que se vea donde haces click
2. **Pausa 2-3 segundos** en cada pantalla importante
3. **Si te equivocas** - Para y empieza de nuevo (no hay cortes)
4. **Practica 2-3 veces** antes de la grabacion final
