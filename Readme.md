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

## API

| Endpoint | Description |
|---|---|
| `POST /documents/upload` | Upload a PDF (multipart form: `file`, `title`, `category`). Extracts text, splits by page, chunks, embeds, stores. |
| `POST /query` | Raw semantic search — returns top 5 matching chunks with similarity scores, no LLM generation. |
| `POST /ask` | Full RAG: retrieves relevant chunks (filtered by `role`), generates a grounded answer, refuses if nothing relevant is found. |
| `GET /customers` | CRM relational data example — customers with nested tickets in one query. |

`POST /ask` body: `{ "question": "...", "role": "support" | "hr" | "admin" }`

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

## Access control

Documents are tagged with a `category` (`technical`, `hr`, `finance`, `general`).
Retrieval filters by category **at the SQL query level** (`WHERE d.category =
ANY($allowed_categories)`), based on the caller's `role` — not filtered after
the fact in application code, which would risk momentarily loading
unauthorized data into memory.

**Verified with a real test:** the same question ("What is this candidate's
name and email?") against a document tagged `hr`:
- As `role: "support"` → refused ("I don't have enough information..."),
  because the `support` role's allowed categories never include `hr`, so the
  HR document's chunks are excluded from the candidate pool before retrieval
  even runs similarity search on them.
- As `role: "hr"` → correctly answered from the HR document.

This is currently a simplified role model (a `role` string passed in the
request body) rather than tied to real authentication — the mechanism is the
same one you'd wire into a JWT-based auth system; extending it would mean
extracting `role` from a verified token instead of a request parameter.

## Known limitations / future work

- **No real authentication** — `role` is passed directly in the request, not
  derived from a verified session/JWT. Priority next step if extending this
  project.
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
- **No automated test suite yet** — testing has been manual (curl + the
  eval harness). Unit/integration tests are a natural next addition.
- **CPU-only local inference is slow** — 20-60s per `/ask` call. A hosted
  API (OpenAI, Anthropic) or GPU inference would reduce this significantly;
  local/free was chosen deliberately for this project's constraints.

## What I'd do differently at production scale

If this needed to serve real traffic: split into at minimum a CRM service and
an AI/retrieval service (the natural seam already exists in the code), move to
a hosted or GPU-backed LLM for latency, add a re-ranking step, and replace the
simplified role check with real JWT-based auth and a proper permissions table
rather than a hardcoded role→category map.