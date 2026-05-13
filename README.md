# Sweeppea Node for n8n

Community node for integrating Sweeppea sweepstakes platform with n8n workflows.

[Sweeppea](https://sweeppea.com) is a sweepstakes management platform that helps businesses create and manage promotional campaigns, contests, and giveaways.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [AI Agent integration](#ai-agent-integration)
- [Example workflows](#example-workflows)
- [Resources](#resources)
- [Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The node groups operations into four resources. Every operation uses the same Sweeppea API V3 credential.

### Participant

- **Count** — Aggregate counts (Participants / AMOE / Opt-Outs / Total) with optional date range
- **Create** — Register a new participant in a sweepstake with dynamic field support
- **Delete** — Remove a participant by `ParticipantToken`
- **Get** — Fetch a single participant by email, phone or token
- **Get Form Fields** — Retrieve the dynamic entry form fields for a sweepstake (useful for building chatbots or dynamic forms)
- **Get Many** — Paginated list of participants with search and date filters

### Sweepstake

- **Clone** — Duplicate an existing sweepstake (by Handler) with new dates and a new Handler
- **Create** — Create a new sweepstake (SMS / Email / Social) with handler and date window
- **Get Many** — Fetch every sweepstake on the authenticated account
- **Pause** — Pause an active sweepstake
- **Unpause** — Re-activate a paused sweepstake
- **Update** — Patch name, start/end dates or start/end times

### Winner

- **Draw** — Pick N winners using the weighted random algorithm, with optional group / spam / opt-out filters
- **Get Many** — Paginated list of previously drawn winners with optional search

### Rule

- **Create** — Submit an official rules HTML document for a sweepstake (first one is marked primary)

## Credentials

You'll need to configure your Sweeppea API credentials:

1. **API Token / API Key** — Your Sweeppea API authentication token
2. **Environment** — Select your target environment:
   - **Production** (`https://api-v3.sweeppea.com`)
   - **Development** (for local testing with a custom API URL)

### How to get your API credentials

1. Log in to your [Sweeppea Dashboard](https://app.sweeppea.com/api-dashboard)
2. Navigate to the **API Keys** tab
3. Generate or copy your API token
4. Use this token in the n8n credential configuration

The credential is tested against `POST /account/health-check`.

## Compatibility

- Requires **Node.js 22.16+**
- Tested with **n8n 2.20.x** and **n8n-workflow 2.16.x**
- Supports the n8n AI Agent through the `usableAsTool` flag

## Usage

### Dynamic field support

Each sweepstake can have different entry fields configured in the Sweeppea platform. Use **Participant → Get Form Fields** to fetch the schema, then **Participant → Create** to register data that matches it.

**Example flow:**

1. **Get Form Fields** — pull the required fields for a sweepstake.
2. Build a dynamic form (or AI chatbot) that collects the required data.
3. **Create** — register the participant with the collected data.

### Field name format

When submitting participant data, field names must use underscores instead of spaces — that is what Sweeppea expects on the wire:

- "First Name" → `First_Name`
- "How did you find us?" → `How_did_you_find_us?`

The body sent to `POST /participants/add` has this shape:

```json
{
  "lang"             : "EN",
  "source"           : "n8n-integration",
  "sweepstakesToken" : "uuid-v4-string",
  "entryPageFields"  : {
    "KeyEmail"       : "user@example.com",
    "KeyPhoneNumber" : "1234567890",
    "BonusEntries"   : 0,
    "Fields"         : {
      "First_Name"    : "John",
      "Last_Name"     : "Doe",
      "Email"         : "user@example.com",
      "Mobile_Number" : "1234567890",
      "Custom_Field"  : "value"
    }
  }
}
```

### Mandatory error handling for participant creation

When using **Participant → Create**, configure error handling at the node level:

1. Click on the Sweeppea node.
2. Go to the **Settings** tab (not Parameters).
3. Under **On Error**, change from "Stop Workflow" to **Continue**.

![Error Handling Configuration](examples/sweeppea-on-error-choose-continue.png)

This lets the node pass error responses (duplicate entries, validation failures, etc.) as data to the next node so you can branch on them, instead of crashing the workflow. The 0.2.0 release standardises this behaviour across every operation — `Sweepstake not found` (404) and `Validation failed` (400) errors that previously short-circuited the workflow are now caught by the same `Continue On Fail` path.

## AI Agent integration

The node is registered with `usableAsTool: true`, so the n8n **AI Agent** node can discover and invoke any of its operations as a tool.

### Quick start (community nodes as tools)

On self-hosted n8n you may need to enable community-node tool usage. Set this environment variable on your n8n process:

```
N8N_COMMUNITY_PACKAGES_ENABLED=true
```

Then add a Sweeppea node to an AI Agent's tool list — n8n will expose every operation (e.g. `participant:create`, `winner:draw`) as a callable function.

> **Heads up:** Some n8n 2.x users have reported empty responses when the AI Agent V3 calls community-node tools. If you hit this and the verification matrix below stays green for direct workflow invocation, the MCP server below is a battle-tested alternative.

### Advanced: connect the MCP Client Tool

For Tier 2/3 operations not exposed by this node (Groups, Files, Notes, Calendar, Tickets, Billing, etc.) Sweeppea publishes a Streamable-HTTP MCP server at **`https://mcp.sweeppea.com`** (71 tools, v1.17.0+).

In n8n, add an **MCP Client Tool** node to your AI Agent with:

- **URL:** `https://mcp.sweeppea.com`
- **Transport:** Streamable HTTP
- **Auth:** Bearer (your Sweeppea API token, same one you use for the credential here)

The MCP Client and the Sweeppea node coexist — use the node for the deterministic Tier 1 flows above and the MCP for everything else, especially conversational / admin tasks.

## Example workflows

This package includes ready-to-import example workflows in the `/examples` folder:

### 1. Simple participant registration

**File:** `sweeppea-create-participant.json`

![Simple Workflow](examples/sweeppea-create-participant.png)

A straightforward workflow that collects participant data through an AI chatbot:

- AI Agent asks for First Name, Last Name, Email, and Mobile Number conversationally
- Transform node converts the collected data to Sweeppea API format
- Creates participant in the sweepstake

**How to use:**

1. Import the workflow JSON file into your n8n instance.
2. Configure your Sweeppea credentials.
3. Replace `YOUR_SWEEPSTAKES_TOKEN_HERE` with your actual sweepstakes token.
4. Activate the workflow.

### 2. Dynamic form registration

**File:** `sweeppea-create-participant-dynamic-form.json`

![Dynamic Workflow](examples/sweeppea-create-participant-dynamic-form.png)

An advanced workflow that automatically adapts to any sweepstake configuration:

- Fetches the sweepstake form fields dynamically from the API
- Builds a custom AI system prompt based on the field configuration
- AI Agent collects all fields conversationally (even optional ones)
- Transform node dynamically maps collected data to API format
- Creates participant with all custom fields

**How to use:**

1. Import the workflow JSON file into your n8n instance.
2. Configure your Sweeppea credentials.
3. Replace `YOUR_SWEEPSTAKES_TOKEN_HERE` with your actual sweepstakes token (appears in two nodes).
4. Activate the workflow.

> The dynamic workflow automatically adapts to any sweepstake configuration, making it ideal for use across multiple campaigns with different field requirements.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Sweeppea Platform](https://sweeppea.com)
- [Sweeppea API V3 Documentation](https://apidocs.sweeppea.com)
- [Sweeppea MCP Server Documentation](https://mcpdocs.sweeppea.com)

## Version history

### 0.2.0

- New build system based on `@n8n/node-cli` (TypeScript 5.9, ESLint 9, flat config); the legacy regex transpiler is gone.
- Modular code layout under `nodes/Sweeppea/{descriptions,operations}/` plus a shared `GenericFunctions.ts` helper.
- New resources and operations:
  - **Participant**: Count, Get, Get Many, Delete (plus the existing Create and Get Form Fields)
  - **Sweepstake**: Clone, Create, Get Many, Pause, Unpause, Update
  - **Winner**: Draw, Get Many
  - **Rule**: Create
- AI Agent support via `usableAsTool: true`.
- Unified error handling: all API failures are mapped to `NodeApiError` / `NodeOperationError`, and `Continue On Fail` now applies consistently to every operation (including 404 on Get Form Fields, which previously short-circuited even with the flag on).
- Credential icon added (no change to credential schema; previously stored credentials keep working).
- Requires Node.js 22.16+.

### 0.1.x

- Initial release with `Participant → Get Form Fields` and `Participant → Create`.
- Dynamic field loading based on sweepstake configuration (API V3).
- Multi-environment support (production, development).
- AI chatbot integration support.

## License

[MIT](LICENSE)

---

© 2026 Sweeppea Development Lab
