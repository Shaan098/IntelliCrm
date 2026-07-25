# IntelliCRM — RAG-Powered Document Q&A for a CRM

A backend service that lets users upload documents (PDFs) and ask natural-language
questions about them, getting back answers grounded in the actual document content —
with page-level citations and role-based access control. Built as a learning project
to understand RAG (Retrieval-Augmented Generation) systems end-to-end, not just call
an API and hope it works.

## The problem

Companies have knowledge scattered across PDFs — policies, technical docs, HR
material — and manually searching them is slow. This project lets you upload a
document and ask questions about it in plain English, with the answer citing exactly
which page it came from, so you can verify it rather than blindly trusting an LLM.

## Architecture

This is a modular monolith, not microservices — a deliberate choice explained below.

```
                    ┌─────────────────┐
                    │   Express API   │
                    │   (Node.js)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌───────────────┐ ┌─────────┐ ┌──────────────┐
      │   Postgres    │ │ Ollama  │ │ Ollama       │
      │  + pgvector   │ │(embed)  │ │ (llama3.1:8b)│
      │               │ │         │ │  generation  │
      │ Customers,    │ └─────────┘ └──────────────┘
      │ Tickets,      │
      │ Documents,    │
      │ Chunks+vectors│
      └───────────────┘
```

Each service is a backing store or model the Express app talks to directly — there's
no serial request chain through unrelated services (a mistake in an earlier version
of this plan, corrected after review).

## Tech stack, and why

| Choice | Why |
|---|---|
| **Postgres (not MongoDB)** | CRM data (Customers → Tickets, Documents → Chunks) is inherently relational, with real foreign keys and join needs. MongoDB is a good fit for document-shaped data with no cross-entity joins — this isn't that. |
| **pgvector (not a separate vector DB)** | One database instead of two. Reduces operational complexity for this scale. Would revisit if retrieval volume/scale grew significantly. |
| **Ollama, local models (not OpenAI API)** | Free, no API key, fully offline-capable. Trade-off: slower inference on CPU-only hardware (20-60s per LLM call) versus a hosted API. For a portfolio project at this scale, cost/simplicity won out over latency. |
| **Modular monolith (not microservices)** | No real scale requirement exists yet. Microservices add distributed-systems complexity (data ownership, network calls, partial failure) with no corresponding benefit at this project's scale. Documented here as a conscious choice, not an oversight. |
| **Prisma + raw SQL for vector ops** | Prisma doesn't natively support the `vector` type, so standard CRUD goes through Prisma's ORM, and vector-specific operations (storing/comparing embeddings) use `$queryRawUnsafe`/`$executeRawUnsafe` with parameterized queries. |

## Setup

**Prerequisites:** Docker Desktop, Node.js, [Ollama](https://ollama.com/download)

```bash
# 1. Start Postgres + pgvector
docker compose up -d

# 2. Install dependencies
npm install

# 3. Set up the database
npx prisma migrate dev

# Enable pgvector and the embedding column (one-time)
docker exec -it intellicrm_db psql -U crm_user -d intellicrm
# then run:
# CREATE EXTENSION IF NOT EXISTS vector;
# ALTER TABLE "DocumentChunk" ADD COLUMN embedding vector(768);

# 4. Pull local models
ollama pull nomic-embed-text
ollama pull llama3.1:8b

# 5. Run the server
npm run dev
```

## Testing

```bash
npm test
```

Runs the unit test suite (Node's built-in test runner, `node --test`) against
`src/utils.js` — chunking, page-splitting, and role/category mapping logic,
tested in isolation with no database or LLM dependency — plus integration
tests for `registerUser`/`loginUser` against the real database (password
hashing, duplicate email rejection, wrong-password rejection). Currently
13/13 passing.

## API

| Endpoint | Auth required | Description |
|---|---|---|
| `POST /auth/register` | No | Register a new user (`name`, `email`, `password`, `role`). Password is hashed with bcrypt before storage. |
| `POST /auth/login` | No | Log in with `email`/`password`, returns a signed JWT (2h expiry) containing the user's `role`. |
| `POST /documents/upload` | Yes — `admin` role only | Upload a PDF (multipart form: `file`, `title`, `category`). Extracts text, splits by page, chunks, embeds, stores. |
| `POST /query` | No | Raw semantic search — returns top 5 matching chunks with similarity scores, no LLM generation. |
| `POST /ask` | Yes — any authenticated user | Full RAG: retrieves relevant chunks (filtered by the role in the caller's verified JWT), generates a grounded answer, refuses if nothing relevant is found. |
| `POST /tickets/:ticketId/draft-email` | Yes — any authenticated user | Combines structured ticket/customer data (Postgres) with retrieved policy context (RAG) to draft a support email. Falls back to a general, honest reply (no invented policy details) if no sufficiently relevant document is found. |
| `GET /customers` | No | CRM relational data example — customers with nested tickets in one query. |

`POST /ask` body: `{ "question": "..." }` — no `role` field. The caller's role comes
entirely from their JWT (`Authorization: Bearer <token>` header), verified server-side.
It cannot be spoofed by changing the request body.

## AI email draft generator

`POST /tickets/:ticketId/draft-email` combines two data sources in one workflow:
structured ticket/customer data from Postgres, and retrieved policy context
via the same RAG pipeline used by `/ask`. This was the original motivating
idea behind the project — using structured CRM data *and* unstructured
document knowledge together, rather than treating RAG as a bolt-on chatbot.

**A real hallucination was caught and fixed during testing.** Initial testing
(role: `support`, ticket: "Battery not charging") produced a draft that
confidently stated a specific warranty timeframe ("1-2 years from the
original factory settings reset") — despite the uploaded CMS technical
document containing no warranty or battery policy content at all. The two
"relevant" chunks that got passed to the LLM were, on inspection, an
unrelated JSON code snippet and a numbered list fragment, matched only
because the relevance threshold (0.5) was too permissive for a genuinely
irrelevant query.

**Fix, verified before/after:**
- Raised the relevance threshold from 0.5 to 0.55 for this endpoint.
- Strengthened the system prompt to explicitly forbid inventing policy
  specifics (timeframes, numbers, conditions) not literally present in the
  retrieved context, and to default to "a team member will follow up" when
  context is insufficient.
- Re-running the identical request afterward: `usedPolicyContext: false`,
  `sources: []`, and the draft honestly states no specific policy details
  were found, asking a colleague to review — instead of fabricating terms.

This is left in the README deliberately rather than only fixing it silently,
because catching and correcting exactly this kind of failure — weak
retrieval plus LLM overconfidence — is the core skill RAG evaluation is
supposed to build.

## Retrieval evaluation

Rather than assert the system "works," I built a small evaluation harness
(`eval.js`) — 8 hand-written questions with expected source pages, run against
the live `/ask` endpoint.

**Result: 7/8 (88%) passed.**

The one failure: a question about "future enhancements" didn't retrieve the
correct page (13) in its top 5 results. Likely cause: the fixed-size chunking
(1000 chars, 150 overlap) may be splitting that section such that its embedding
doesn't rank highly for that phrasing, or the heading text has low semantic
overlap with the question wording. This is a real, known limitation — not
hidden — and a candidate for improvement (see below).

The evaluation also confirms a negative case: a clearly out-of-scope question
("What is the capital of France?") is correctly refused rather than answered
with a hallucination, because the top similarity score falls below a
0.5 threshold.

## Authentication

Real authentication, not a placeholder:
- Passwords are hashed with **bcrypt** (10 salt rounds) before being stored —
  plain-text passwords are never written to the database.
- `/auth/login` verifies the password against the stored hash and issues a
  **JWT** (signed with a server-side secret, 2-hour expiry) containing the
  user's `userId`, `role`, and `email`.
- `/ask` and `/documents/upload` are protected by an `authenticateToken`
  Express middleware that verifies the JWT's signature and expiry before
  allowing the request through. If the token is missing or invalid, the
  request is rejected (401/403) before any retrieval or generation happens.
- The caller's `role` is read from `req.user.role` — the **decoded, verified
  token payload** — never from the request body. Earlier in development,
  `role` was passed directly in the request body for testing; this was a real
  gap (anyone could just claim `"role": "admin"`) and has since been closed.

## Access control

Documents are tagged with a `category` (`technical`, `hr`, `finance`, `general`).
Retrieval filters by category **at the SQL query level** (`WHERE d.category =
ANY($allowed_categories)`), based on the caller's verified `role` — not
filtered after the fact in application code, which would risk momentarily
loading unauthorized data into memory.

Document uploads are further restricted to the `admin` role only — since
uploading a document sets its `category`, which controls who can later read
it, this is treated as a privileged action rather than open to any
authenticated user.

**Verified with a real test:** the same question ("What is this candidate's
name and email?") against a document tagged `hr`, using two different logged-in
users:
- A `support`-role user (real login, real JWT) → refused ("I don't have
  enough information..."), because the `support` role's allowed categories
  never include `hr`, so the HR document's chunks are excluded from the
  candidate pool before retrieval even runs similarity search on them.
- An `hr`-role user → correctly answered from the HR document.

Also verified: calling `/ask` with **no token at all** is rejected outright
(`401 No token provided`) before retrieval or generation ever runs.

## Known limitations / future work

- **Roles are hardcoded, not a real permissions table** — `ROLE_CATEGORY_ACCESS`
  is a fixed object in code (`admin`/`support`/`hr` → allowed categories).
  A production system would store roles/permissions in the database so they're
  configurable without a code deploy.
- **No token refresh / revocation** — JWTs expire after 2 hours with no refresh
  flow, and there's no way to invalidate a token before it expires (e.g., on
  logout or if compromised). Would add refresh tokens and a revocation list
  for anything beyond a portfolio/demo scope.
- **Retrieval isn't perfect** — 88% on a small eval set, with one known
  chunking-related miss. Would explore: semantic chunking (splitting on
  headings/paragraphs instead of fixed character counts), a larger/different
  embedding model, or hybrid search (keyword + vector).
- **No re-ranking step** — currently uses raw cosine similarity ranking only.
  A cross-encoder re-ranking pass on the top-N candidates would likely improve
  precision.
- **Single-node, no horizontal scaling** — appropriate for this project's
  scale; would need connection pooling, read replicas, and a managed vector
  store at real production volume.
- **Test coverage is partial** — unit tests (`node --test`) cover the pure
  utility functions (chunking, page-splitting, role/category mapping) in
  isolation. Route-level integration tests (register/login/ask against a real
  or mocked DB) aren't written yet — a natural next addition.
- **CPU-only local inference is slow** — 20-60s per `/ask` call. A hosted
  API (OpenAI, Anthropic) or GPU inference would reduce this significantly;
  local/free was chosen deliberately for this project's constraints.

## What I'd do differently at production scale

If this needed to serve real traffic: split into at minimum a CRM service and
an AI/retrieval service (the natural seam already exists in the code), move to
a hosted or GPU-backed LLM for latency, add a re-ranking step, move roles and
permissions into the database instead of hardcoded config, and add refresh
tokens / revocation to the auth system.