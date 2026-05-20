# Sweeppea Showcase Workflow — Explainer

> Companion document for `sweeppea-showcase.json` in this folder. Intended for the n8n review team if you're updating `n8n-nodes-sweeppea` (v0.1.x → v0.2.0) and want to demonstrate every operation at a glance.

## What this workflow is for

`n8n-nodes-sweeppea` v0.2.0 is an **update** of an existing community node, not a new submission. The original v0.1.x shipped two operations (`Participant → Get Form Fields`, `Participant → Create`); v0.2.0 expands the node to **4 resources / 15 operations** and adds `usableAsTool: true`.

This showcase workflow exercises every one of those 15 operations on a single canvas so reviewers can see the surface area at a glance and run it end-to-end with one click. Everything that is destructive lives in **disabled** nodes — toggle them on individually to inspect their parameters or execute them.

## Flow

A `Manual Trigger` ("Execute workflow" button) feeds a `Set Config` node. `Set Config` is the single source of truth for the run: it stores the `sweepstakesToken` of the test sweepstake (`AGENTPRUEBA`), a per-execution test email derived from `$execution.id`, dummy phone, and the `Fields` object used by `Participant: Create`.

From `Set Config`, the flow fans out into **5 lanes**, one per Sweeppea resource:

- **Sweepstake** (blue): `Get Many → Pause → Unpause → Update (rename) → Update (revert)`. All reversible. `Create` and `Clone` are present but disabled (they would persist data).
- **Participant — read-only** (purple): `Get Form Fields → Count → Get Many → Get (by email)`.
- **Participant — CRUD round-trip** (purple): `Create → Get (just created) → Delete`. The chain cleans up after itself; the email is unique per execution, so reruns are idempotent.
- **Winner** (blue): `Get Many`. `Draw` is disabled (would mark a real winner).
- **Rule** (blue): `Create` is disabled (would persist a rules document).

Each Sweeppea node has the `Sweeppea API` credential pre-bound in the JSON, so reviewers only need to map their own credential once after import. Parameters use `={{ $('Set Config').first().json.X }}` expressions so the data binding is visible in every node panel.

## How to use it

1. Open n8n.
2. **Workflows → Create workflow → paste the JSON** (Cmd/Ctrl+V on the canvas). It imports as `Sweeppea v0.2.0 — Showcase (All 15 Ops)`.
3. Re-bind the `Sweeppea API` credential on any one node and n8n will offer to apply it to the rest.
4. Click **Execute workflow**. A clean run takes about 18–20 seconds and lights 11 nodes green; the 4 disabled nodes stay grey.
5. To exercise a disabled op, click its power toggle, hit Execute again. Clean up the artefacts it created from the Sweeppea dashboard.

## What this validates for review

- The node registers in n8n's node picker and renders the 4-resource / 15-operation tree correctly.
- `usableAsTool: true` is honoured (n8n auto-generates the `*Tool` variant of the node; not used in this workflow but verifiable in the node picker).
- All HTTP shapes, parameter casing inconsistencies (`sweepstakesToken` vs `SweepstakesToken` per endpoint) and the special `HTTP DELETE` on `/participants/delete` are correct against the live API.
- Credential, error mapping (`NodeApiError` / `NodeOperationError`), and `continueOnFail` behaviour all work as documented in the README.
