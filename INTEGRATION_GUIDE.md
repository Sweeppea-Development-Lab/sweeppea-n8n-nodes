# 🎯 Complete Integration Guide - Sweeppea N8N Node

## 📖 Table of Contents

1. [What is this integration?](#what-is-this-integration)
2. [System Architecture](#system-architecture)
3. [Complete Step-by-Step Flow](#complete-step-by-step-flow)
4. [API Endpoints](#api-endpoints)
5. [How the Node Works](#how-the-node-works)
6. [Testing Guide](#testing-guide)
7. [Frequently Asked Questions](#frequently-asked-questions)

---

## 🎯 What is this integration?

This integration allows **N8N** (an automation tool) to create participants in **Sweeppea** sweepstakes intelligently and dynamically.

### Why is it useful?

Imagine a user writes you via **WhatsApp** saying "I want to participate in the sweepstakes". An AI bot:
1. Asks which sweepstakes they want
2. **Automatically queries** what fields that specific sweepstakes needs
3. **Asks the user** for each required field conversationally
4. When it has all the data, **creates the participant automatically**
5. Confirms their entry number

**WITHOUT** this integration: You would need to manually program each sweepstakes with its specific fields.
**WITH** this integration: A single workflow works for ALL sweepstakes, because it adapts dynamically.

### 💡 Real Example

**User:** "Hello, I want to participate"
**Bot:** "Great! Which sweepstakes do you want to enter?"
**User:** "Summer Giveaway 2025"
**Bot:** *(automatically queries what fields it needs)* "Perfect. I need some information. What's your email?"
**User:** "john@example.com"
**Bot:** "Your first name?"
**User:** "John"
**Bot:** "Your last name?"
**User:** "Smith"
**Bot:** "Your age?"
**User:** "28"
**Bot:** "What country are you from?"
**User:** "Argentina"
**Bot:** *(automatically creates the participant)* "Done John! You're registered in Summer Giveaway 2025 with number SUMMER_2025-000042"

---

## 🏗️ System Architecture

```
┌─────────────────┐
│   WhatsApp      │
│   (User)        │
└────────┬────────┘
         │ "I want to participate"
         ▼
┌─────────────────┐
│   AI/ChatBot    │
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
│  Sweeppea Node  │ ◄── This is our code
└────────┬────────┘
         │ 1. Query schema
         │ 2. Create participant
         ▼
┌─────────────────┐
│  Sweeppea API   │
│   (Backend)     │
└─────────────────┘
```

### Components:

1. **Mock Server** (`mock-server/server.js`)
   - Test server that simulates the real Sweeppea API
   - Only for development and testing
   - Runs on `http://localhost:3002`

2. **Credentials** (`credentials/SweeppeaApi.credentials.ts`)
   - Handles authentication
   - Allows environment selection (Production, Staging, Development)

3. **Node** (`nodes/Sweeppea/Sweeppea.node.ts`)
   - The node you see in N8N
   - Contains all the logic for communicating with the API

---

## 🔄 Complete Step-by-Step Flow

### Real Scenario: User converses via WhatsApp to participate in "Summer Giveaway 2025"

#### **STEP 1: User initiates conversation via WhatsApp**

**User writes:**
```
"Hello, I want to participate in Summer Giveaway 2025"
```

The message arrives at N8N through a WhatsApp webhook (or Evolution API, etc.)

#### **STEP 2: AI/Bot queries what fields the sweepstakes needs**

Before asking the user ANYTHING, the bot needs to know what fields to request. This is where we use our node.

**The N8N workflow:**
1. Receives the message "I want to participate in Summer Giveaway 2025"
2. Identifies that the sweepstakes is `summer_2025`
3. **Uses the Sweeppea node just to QUERY the schema** (not to create yet)

**Temporary node configuration for query:**
- **Sweepstake ID**: `summer_2025`
- **Credentials**: Configured
- We only want the schema, not to create participant yet

> **IMPORTANT:** In this step we DON'T create the participant. We only query what fields we need.

#### **STEP 3: N8N/Workflow queries the sweepstakes schema**

**Why?** Because we need to know what to ask the user.

N8N makes an HTTP request (you don't need the Sweeppea node for this, it's just an HTTP Request):

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

#### **STEP 4: AI/Bot interprets the schema and begins conversation**

The AI now knows it needs 5 required fields: email, firstName, lastName, age, country.

**Bot responds to user via WhatsApp:**
```
"Perfect John! To register you in Summer Giveaway 2025, I need some information.
What's your email?"
```

#### **STEP 5: User responds to fields one by one**

**Conversation:**

```
Bot: "What's your email?"
User: "john@example.com"

Bot: "Your first name?"
User: "John"

Bot: "Your last name?"
User: "Smith"

Bot: "Your age?"
User: "28"

Bot: "What country are you from?"
User: "Argentina"

Bot: "Do you want to receive our newsletter? (optional)"
User: "Yes"
```

**The N8N workflow saves each response** in variables or in a temporary database.

#### **STEP 6: When we have ALL the data, create the participant**

Now we DO use the **Sweeppea node** to create the participant.

**The workflow sends to our node:**
```json
{
  "sweepstakeId": "summer_2025",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "age": 28,
  "country": "Argentina",
  "newsletter": true
}
```

**The Sweeppea node:**
1. Validates that all required fields are present
2. Makes the POST to the API:

```http
POST /api-v1/n8n/participants
{
  "sweepstakeId": "summer_2025",
  "data": {
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "age": 28,
    "country": "Argentina",
    "newsletter": true
  }
}
```

**API responds:**
```json
{
  "success": true,
  "participantId": "part_1760407343582_7bpj87",
  "entryNumber": "SUMMER_2025-000042",
  "createdAt": "2025-10-14T02:02:23.582Z"
}
```

#### **STEP 7: Bot confirms to user**

**Bot sends final message via WhatsApp:**
```
"Done John! 🎉

You're registered in Summer Giveaway 2025
Your entry number is: SUMMER_2025-000042

Good luck! 🍀"
```

### 🎯 Why this flow is PERFECT?

1. ✅ **Dynamic**: If tomorrow you create a sweepstakes with other fields, the same workflow works
2. ✅ **Conversational**: User doesn't fill boring forms
3. ✅ **Intelligent**: AI can validate responses and ask for clarifications
4. ✅ **Flexible**: Works with WhatsApp, Telegram, Discord, any chat
5. ✅ **Scalable**: A single bot handles ALL your sweepstakes

---

## 🔌 API Endpoints

### 1. **GET Schema** - Get sweepstakes fields

**Endpoint:** `GET /api-v1/n8n/sweepstakes/:sweepstakeId/schema`

**Purpose:** Know what fields you need to send to create a participant in that specific sweepstakes.

**Headers:**
```
Authorization: Bearer sk_test_mock123456789
```

**Usage example:**
```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/n8n/sweepstakes/summer_2025/schema
```

**Successful response (200):**
```json
{
  "success": true,
  "sweepstakeId": "summer_2025",
  "name": "Summer Mega Giveaway 2025",
  "fields": [...]
}
```

**Possible errors:**

| Code | Error | Reason |
|------|-------|--------|
| 401 | Unauthorized | Invalid or missing API key |
| 404 | Not Found | The sweepstakeId doesn't exist |

---

### 2. **POST Participant** - Create participant

**Endpoint:** `POST /api-v1/n8n/participants`

**Purpose:** Create a new participant in a sweepstakes.

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
    "email": "user@example.com",
    "firstName": "First",
    "lastName": "Last",
    "age": 25,
    "country": "Argentina",
    "newsletter": true
  }
}
```

**Usage example:**
```bash
curl -X POST http://localhost:3002/api-v1/n8n/participants \
  -H "Authorization: Bearer sk_test_mock123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "sweepstakeId": "summer_2025",
    "data": {
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "age": 25,
      "country": "Argentina"
    }
  }'
```

**Successful response (201):**
```json
{
  "success": true,
  "participantId": "part_1760407343582_7bpj87",
  "entryNumber": "SUMMER_2025-000001",
  "createdAt": "2025-10-14T02:02:23.582Z",
  "data": {...}
}
```

**Possible errors:**

| Code | Error | Reason | Solution |
|------|-------|--------|----------|
| 400 | Validation Failed | Missing required field or validation failed | Verify all required fields are present |
| 404 | Not Found | The sweepstakeId doesn't exist | Use a valid sweepstakeId |
| 409 | Conflict | Duplicate email | The email already participated in this sweepstakes |

**Example 400 error:**
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

### 3. **GET Check Participant** - Check if participant exists

**Endpoint:** `GET /api-v1/n8n/sweepstakes/:sweepstakeId/participants/check`

**Purpose:** Check if an email or phone number is already registered in a sweepstakes.

**Query Parameters:**
- `email` - Email address to check
- `phone` - Phone number (10 digits) to check

**Note:** Provide either `email` OR `phone`, not both.

**Usage example:**
```bash
# Check by email
curl -H "Authorization: Bearer sk_test_mock123456789" \
  "http://localhost:3002/api-v1/n8n/sweepstakes/summer_2025/participants/check?email=test@example.com"

# Check by phone
curl -H "Authorization: Bearer sk_test_mock123456789" \
  "http://localhost:3002/api-v1/n8n/sweepstakes/summer_2025/participants/check?phone=5551234567"
```

**Successful response (participant exists):**
```json
{
  "success": true,
  "exists": true,
  "participantId": "part_1760407343582_7bpj87",
  "entryNumber": "SUMMER_2025-000042",
  "createdAt": "2025-10-14T02:02:23.582Z"
}
```

**Successful response (participant doesn't exist):**
```json
{
  "success": true,
  "exists": false
}
```

---

### 4. **Debug Endpoints** (Development only)

#### GET Health Check
```bash
curl http://localhost:3002/health
```

Response:
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

## 🎮 How the Node Works

### Node Configuration in N8N

When you add the "Sweeppea" node in N8N, you'll see these options:

1. **Credentials** (Required)
   - Select the previously configured credentials

2. **Resource** (Required)
   - Participant

3. **Operation** (Required)
   - **Get Schema**: Get the required fields for a sweepstakes
   - **Check Participant**: Check if email/phone is already registered
   - **Create**: Create a new participant

4. **Sweepstake ID** (Required)
   - The sweepstakes ID (e.g.: `summer_2025`, `holiday_special`)

5. **Use Input Data** (Optional, default: true for Create operation)
   - If `true`: Node takes ALL data from previous node
   - If `false`: You would need to map fields manually (not implemented yet)

### What does the node do internally?

```javascript
// STEP 1: Get credentials and configuration
const sweepstakeId = "summer_2025";  // What you configured
const credentials = {...};            // API key and environment

// STEP 2: Build base URL based on environment
if (environment === 'production') {
  baseUrl = 'https://api.sweeppea.com';
} else if (environment === 'staging') {
  baseUrl = 'https://staging-api.sweeppea.com';
} else {
  baseUrl = 'http://localhost:3002';  // Development
}

// STEP 3: Request schema
const schema = await fetch(
  `${baseUrl}/api-v1/n8n/sweepstakes/${sweepstakeId}/schema`
);

// STEP 4: Map data from input
const inputData = {...};  // Data from previous node
const participantData = {};

for (const field of schema.fields) {
  if (inputData[field.name]) {
    participantData[field.name] = inputData[field.name];
  }
}

// STEP 5: Validate required fields
for (const field of schema.fields) {
  if (field.required && !participantData[field.name]) {
    throw new Error(`Field ${field.name} is required`);
  }
}

// STEP 6: Create participant
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

// STEP 7: Return result to workflow
return result;
```

---

## 🧪 Testing Guide

### Prerequisites

1. **Node.js installed** (v16 or higher)
2. **Git installed**
3. **N8N installed** (locally or in cloud)

### Step 1: Start the Mock Server

```bash
# In terminal 1
cd mock-server
node server.js
```

**You should see:**
```
🚀 Sweeppea Mock API Server
📡 Running on: http://localhost:3002
🔑 Test API Key: sk_test_mock123456789

📚 Available endpoints:
   GET  /health
   GET  /api-v1/n8n/sweepstakes/:sweepstakeId/schema
   GET  /api-v1/n8n/sweepstakes/:sweepstakeId/participants/check
   POST /api-v1/n8n/participants
   GET  /api-v1/debug/participants
   GET  /api-v1/debug/sweepstakes

✨ Ready to accept requests!
```

### Step 2: Test Endpoints Directly

**Test 1: Health Check**
```bash
curl http://localhost:3002/health
```

Should return:
```json
{"success":true,"status":"healthy",...}
```

**Test 2: Get Schema**
```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/n8n/sweepstakes/summer_2025/schema
```

Should return the schema with fields.

**Test 3: Check Participant**
```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  "http://localhost:3002/api-v1/n8n/sweepstakes/summer_2025/participants/check?email=test@example.com"
```

Should return:
```json
{
  "success": true,
  "exists": false
}
```

**Test 4: Create Participant**
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

Should return:
```json
{
  "success": true,
  "participantId": "part_...",
  "entryNumber": "SUMMER_2025-000001",
  ...
}
```

**Test 5: Verify Created Participant**
```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/debug/participants
```

You should see the participant you just created.

**Test 6: Test Duplicate Email**

Execute Test 4 again (same email). Should return error 409:
```json
{
  "success": false,
  "error": "Conflict",
  "message": "A participant with email 'test@example.com' already exists..."
}
```

### Step 3: Configure N8N

#### 3.1 Link the node with N8N

```bash
# In project root
npm link

# In your N8N installation
cd ~/.n8n/custom
npm link n8n-nodes-sweeppea
```

#### 3.2 Restart N8N

```bash
# If you have N8N running locally
n8n start
```

#### 3.3 Create Credentials in N8N

1. Go to **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "Sweeppea API"
4. Configure:
   - **Environment:** Development
   - **API Key:** `sk_test_mock123456789`
   - **Custom API URL:** `http://localhost:3002`
5. Click **Test** → Should say "Connection successful"
6. Save

### Step 4: Create Test Workflow

#### 4.1 Simple Workflow

1. Create a new workflow
2. Add **"Manual"** node (manual trigger)
3. Add **"Set"** node to simulate data:
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
4. Add **"Sweeppea"** node:
   - Credentials: Select the ones you created
   - Resource: Participant
   - Operation: Create
   - Sweepstake ID: `summer_2025`
5. Connect: Manual → Set → Sweeppea
6. Click **Execute Workflow**

**Expected result:**
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

#### 4.2 Workflow with WhatsApp

**WhatsApp flow:** User sends message → AI Agent collects 5 fields conversationally → Switch detects JSON with create_participant action → Code parses JSON → Sweeppea node creates participant → Success message sent back via WhatsApp

---

## ❓ Frequently Asked Questions

### What's the difference between the mock server and the real API?

**Mock Server:**
- Test server running locally
- Only for development
- Data stored in memory (lost on restart)
- URL: `http://localhost:3002`

**Real API:**
- Sweeppea production server
- Real data saved to database
- URL: `https://api.sweeppea.com`

### What is a sweepstakeId?

It's a unique identifier for each sweepstakes in Sweeppea. For example:
- `summer_2025` → Summer Giveaway 2025
- `holiday_special` → Holiday Special Giveaway
- `black_friday_2025` → Black Friday Giveaway

Each sweepstakes can have different fields.

### Why do I need to call the schema endpoint first?

Because **each sweepstakes can have different fields**. The schema tells you:
- What fields you need to send
- Which ones are required
- What data type is expected (string, number, boolean, etc.)
- What validations apply

**Without schema:** You wouldn't know what to send
**With schema:** You know exactly what you need

### What happens if I send a field not in the schema?

The extra field is ignored. Only fields defined in the schema are processed.

### What happens if I DON'T send a required field?

You receive a 400 error with a message indicating which fields are missing.

### Can I create the same participant twice?

No. If you try to create a participant with an email that already exists in that sweepstakes, you receive error 409 (Conflict).

### How do I know if my participant was created successfully?

The response has `"success": true` and gives you:
- `participantId`: Unique participant ID
- `entryNumber`: Entry number (e.g.: "SUMMER_2025-000001")
- `createdAt`: Creation date/time

### What environments are available?

1. **Development:** `http://localhost:3002` (mock server)
2. **Staging:** `https://staging-api.sweeppea.com` (when available)
3. **Production:** `https://api.sweeppea.com` (when available)

### How do I switch environments?

In N8N credentials:
1. Go to Settings → Credentials
2. Edit Sweeppea credentials
3. Change the "Environment" field

### Does the node work with multiple items?

Yes! If the previous node returns 10 items, the Sweeppea node processes all 10 automatically, creating 10 participants.

### What happens if one of the 10 items fails?

Depends on "Continue on Fail" configuration:
- **If enabled:** Processes other items and marks the failed one with error
- **If disabled:** Stops at the first error

### How can I see all created participants?

```bash
curl -H "Authorization: Bearer sk_test_mock123456789" \
  http://localhost:3002/api-v1/debug/participants
```

### How do I reset the mock server?

Simply restart it:
```bash
# Ctrl+C to stop
# Then:
node server.js
```

All created participants are lost (it's only for testing).

---

## 🎓 Explanation for Your Team

Here's a script you can use to explain the integration:

---

**"Guys, let me explain how this works:"**

**1. The Problem:**
Before, if someone filled a form to participate in a sweepstakes, we had to create the participant manually. Imagine doing it 1000 times a day.

**2. The Solution:**
Now we have a custom node in N8N that does everything automatically.

**3. How Does It Work?**

Imagine you have a sweepstakes called "Summer 2025" where we ask for: email, first name, last name and age.

**Step A:** A user fills the form
**Step B:** The data arrives at N8N
**Step C:** Our node asks Sweeppea: "Hey, what fields do you need for Summer 2025?"
**Step D:** Sweeppea responds: "I need email, first name, last name and age"
**Step E:** Our node takes the form data and sends it to Sweeppea
**Step F:** Sweeppea creates the participant and gives us an entry number

**4. Why is it dynamic?**

Because if tomorrow we create a new sweepstakes "Black Friday" that only asks for email and name, the same node works. It asks what fields it needs and adapts.

**5. What did we do?**

We created:
- A node for N8N
- A credentials system to connect
- A test server (mock) to test without touching production

**6. What can you test?**

I'll show you live how to:
- Start the test server
- Create a workflow in N8N
- Simulate someone filling a form
- See how the participant is created automatically

---

## 📝 Final Notes

- The mock server has 2 example sweepstakes: `summer_2025` and `holiday_special`
- The test API key is: `sk_test_mock123456789`
- Data is stored in memory, lost on server restart
- For production, just change the environment in credentials

**Have questions?** Review this guide or contact the development team.

---

**Last updated:** 2025-10-14
**Version:** 1.0
**Author:** Sweeppea Development Lab
