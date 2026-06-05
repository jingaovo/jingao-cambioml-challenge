Author: Jin Gao

# AI Agent Dashboard

A production-quality AI agent dashboard built on the [Vercel Computer Use demo](https://github.com/vercel-labs/ai-sdk-computer-use). Chat with a Claude agent that controls a remote desktop via computer-use tools, with live VNC streaming, typed event tracking, and multi-session history.

## Live Demo

https://cambio-ml-j22gao-4020-jingao-s-projects.vercel.app

[Demo Video](https://drive.google.com/file/d/1KFcrxA6kqikFLn1ut79u5tzKhntOflNI/view?usp=share_link)

## Features

- **Two-panel dashboard** — Chat (left) + VNC viewer & tool details (right), horizontally resizable
- **Inline tool call visualizations** — Click any tool call to inspect payload, result, and timing
- **Collapsible debug panel** — Live event store with counts per action type and raw JSON
- **Typed event pipeline** — Discriminated unions for tool events (id, timestamp, type, payload, status, duration)
- **Multi-session chat history** — Create, switch, and delete sessions; persisted to `localStorage`
- **VNC render isolation** — Desktop stream is memoized and hoisted outside the chat tree; chat updates do not re-render the iframe
- **Mobile-responsive layout** — Tab navigation (Chat | Desktop | Details) with session drawer

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          Browser (Next.js 15)                            │
├───────────────┬────────────────────────────┬─────────────────────────────┤
│ Session       │ Chat Panel + Debug Panel   │ VNC Stream + Tool Details   │
│ Sidebar       │ useSessionWorkspace        │ selectedEvent               │
│ (localStorage)│   ↑ useChat (AI SDK)       │ DesktopStreamPanel          │
│               │   ↓ syncEventStore()       │                             │
│               │   → Event Store            │                             │
└───────────────┴────────────────────────────┴─────────────────────────────┘
                                    │
                                    ▼
                          POST /api/chat
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            Claude Sonnet 4.5                 Vercel Sandbox
         (computer + bash tools)          (Xvnc, Chrome, noVNC)
```

### Data flow

1. User sends a message → `useChat` streams to `/api/chat`
2. Claude invokes `computer` / `bash` tools against the sandbox desktop
3. `syncEventStore()` observes message parts and builds typed `AgentEvent` records
4. Selectors derive agent status, action counts, and durations for the debug panel
5. Sessions (messages + event store) persist to `localStorage` on change

### Key technical decisions

| Decision | Rationale |
|----------|-----------|
| Pure `syncEventStore()` instead of effect-driven reducer | Events update in the same render cycle; no flash or duplicate parsing |
| `ActiveSessionBridge` keyed by session ID | Clean `useChat` reset on session switch without stale message bleed |
| `DesktopStreamPanel` hoisted at page level | VNC iframe does not re-render on chat/tool updates |
| `fast-deep-equal` before session persist | Prevents `updatedAt` bumps (and tab reorder) on view-only session switches |
| Discriminated unions for tool events | Type-safe payloads for `computer.*` vs `bash`; no `any` |

## Project structure

```
app/
  page.tsx                    # Dashboard shell, sandbox + session orchestration
  api/chat/route.ts           # AI SDK streaming endpoint
components/dashboard/
  session-sidebar.tsx         # Session list (create / switch / delete)
  chat-panel.tsx              # Messages, input, debug panel
  desktop-stream-panel.tsx    # Memoized VNC wrapper
  tool-detail-panel.tsx       # Expanded tool call inspector
  debug-panel.tsx             # Live event store viewer
lib/
  events/                     # Typed event pipeline (sync, selectors, types)
  sessions/                   # localStorage persistence + session utils
  hooks/                      # useSandbox, useSessions, useSessionWorkspace
  sandbox/                    # Vercel Sandbox + computer/bash tools
  tool-calls/                 # Message → ToolCall extraction + labels
```

## Running locally

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io)
- A [Vercel](https://vercel.com) account (for Sandbox access)
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Link Vercel project and pull OIDC token
pnpm install -g vercel
vercel link
vercel env pull

# 3. Create a sandbox snapshot (~10 min, one-time)
npx tsx lib/sandbox/create-snapshot.ts
# Copy the output snap_* ID into .env.local

# 4. Add your Anthropic key to .env.local
# ANTHROPIC_API_KEY=sk-ant-...

# 5. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

See [`.env.example`](.env.example) for all environment variables.

## Deploy to Vercel

1. Push this repo to GitHub (private)
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `SANDBOX_SNAPSHOT_ID` | Yes | Snapshot from `create-snapshot.ts` |
| `VERCEL_TOKEN` | Yes* | Personal access token (if not using OIDC) |
| `VERCEL_TEAM_ID` | Yes* | Vercel team ID |
| `VERCEL_PROJECT_ID` | Yes* | Vercel project ID |

\* On Vercel deployments, OIDC is typically auto-configured. For local dev, use `vercel env pull` or set the token trio manually.

4. Deploy. Sandboxes are created on first page load.

> **Note:** Sandboxes default to a **5-minute timeout**. Click **New desktop** if the VNC stream disconnects after idle time.

## Collaborators

Invite these GitHub users as collaborators on the private repo:

- `lingjiekong`
- `ghamry03`
- `goldmermaid`
- `EnergentAI`

## Tech stack

- [Next.js 15](https://nextjs.org) (App Router)
- [AI SDK](https://sdk.vercel.ai) + [Anthropic Claude Sonnet 4.5](https://docs.anthropic.com) computer use
- [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox) + noVNC
- [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS 4](https://tailwindcss.com)
- TypeScript

## License

Built for the CambioML 2026.1 Frontend Engineering coding challenge. Based on the [Vercel AI SDK Computer Use demo](https://github.com/vercel-labs/ai-sdk-computer-use).
