# UniMate — Smart Campus Platform

> **An integrated smart-campus platform for students and campus service teams.**

UniMate consolidates essential campus workflows into a coherent, role-aware digital experience. The system is architected around five core modules:
1. **AI Campus Assistant** — Hybrid RAG combining local deterministic retrieval and Google Gemini (`gemini-2.5-flash`) grounded generation with verified university circular citations.
2. **Campus Navigation** — Verified building, lecture hall, and facilities directory with provenance tracking.
3. **Canteen Pre-ordering** — Daily menus, INR (₹) pricing transparency, and meal pre-ordering with atomic kitchen queue.
4. **Xerox / Printing** — Secure document upload, print specifications, and fulfillment tracking.
5. **Lost & Found** — Campus property reporting, privacy-protected claims, and security desk registry.

---

## 1. Implementation Status

UniMate has completed **Phase 1 (Foundation & Security Hardening)**, **Phase 1.5 (Public Landing Page)**, **Phase 2 (Complete Core Module Development)**, and **Phase 3 (Production Readiness, Hybrid AI, Data Onboarding & Public Deployment)**:

| Layer / Workstream | Technology | Status | Implementation Details |
|---|---|---|---|
| **Public Landing Page** | React 18 + Tailwind CSS | Completed | Professional public landing page at `/` with hero product preview, five service showcase cards, interactive tab selector, and role-aware navigation |
| **Frontend Core** | React 18 + Vite + Tailwind CSS | Completed | Full-featured UI for all 5 modules, responsive navigation drawer, toast feedback, modal drawers, and zero fabricated numbers |
| **State & Auth** | Context API + Axios Interceptors | Completed | Session persistence, JWT decoding, role-based route guards, least-privilege view isolation |
| **Backend Core** | Node.js + Express.js | Completed | Layered architecture (Controllers, Routes, Middleware), centralized error handling, multipart file uploads, rate limiting, and security headers |
| **Database** | MySQL Server (InnoDB, utf8mb4) | Completed | 13 relational tables, strict foreign keys, composite indexes, atomic transaction orders, and revision history |
| **Workstream 1: Navigation** | Express + React + MySQL | Completed | Location search, category filters, Admin location creation, editing, status toggling, and data classification provenance |
| **Workstream 2: Canteen** | Express + React + MySQL | Completed | Menu catalog with INR prices, server-side transaction total calculation, order cancellation, kitchen queue, operator lifecycle, collision-proof order numbers |
| **Workstream 3: Printing** | Multer + Express + React | Completed | Secure multipart upload (PDF, DOCX <= 10MB) to private storage, page specification calculator, authorized file download, operator queue |
| **Workstream 4: Lost & Found** | Express + React + MySQL | Completed | Reporting workflow, privacy protection for reporter contact details, security claim submission, admin status management |
| **Workstream 5: Hybrid AI** | Python FastAPI + Google Gemini | Completed | Hybrid architecture supporting Google Gemini (`gemini-2.5-flash`) grounded generation with automatic fallback to deterministic extraction, unverified query refusal, and live corpus sync |
| **Workstream 6: Data Onboarding** | Express + React + MySQL | Completed | Admin Data Management & Provenance console, institutional document ingestion, 3-state verification lifecycle, audit revisions, and stats tracking |
| **Workstream 7: Production Cloud** | Docker, Nginx, Compose, Helmet | Completed | Multi-stage Dockerfiles for client, server, and AI service, Nginx SPA routing, backup/restore tooling, and cloud deployment guides |
| **Automated Testing** | Node.js Native Test Runner | Verified | **63/63 tests passing** across 12 test suites in ~1000ms with 0 failures |

---

## 2. High-Level Architecture

```text
Student / Service Operator / Campus Admin
                  |
                  v
       React + Vite SPA (Port 80 / 5173)
       [Nginx Production Container / Vite Dev Server]
                  |
                  | REST API (JWT Bearer Token, Strict CORS, Rate Limited)
                  v
       Node.js + Express API (Port 5001)
       [Layered: Routes -> Middleware -> DB Pool -> File Storage]
             /                         \
            /                           \ (HTTP Internal API Proxy)
           v                             v
    MySQL Database (Port 3306)     Python + FastAPI AI Subsystem (Port 8000)
    [13 Relational Tables]         [Hybrid RAG: Local Keyword Matcher + Gemini SDK]
                                                 |
                                                 v
                                   Google Gemini 2.5 Flash API
                                   [Strict Grounding Container]
```

---

## 3. Database Schema Overview

The relational database (`unimate_db`) includes 13 relational tables:

1. `users` — Authentication identity, hashed passwords (bcrypt), assigned roles (`student`, `operator`, `admin`), and operator service assignments (`canteen`, `printing`).
2. `campus_locations` — Searchable campus locations with building, floor, category, code, and provenance classification.
3. `canteen_menu_items` — Food items with categories, prices in INR (₹), availability flags, and provenance classification.
4. `canteen_orders` — Student meal orders with collision-proof order numbers (`ORD-YYYYMMDD-XXXX`), lifecycle statuses, and server-calculated totals.
5. `canteen_order_items` — Relational line items for canteen orders with quantity and unit price.
6. `uploaded_files` — Secure file registry storing metadata, original filename, randomized storage path, and ownership.
7. `print_requests` — Print submissions with specifications (`color_mode`, `print_type`, `pages`, `copies`, `binding`) and tracking numbers (`PRT-YYYYMMDD-XXXX`).
8. `lost_found_items` — Misplaced and recovered items with privacy protection and status tracking.
9. `status_history` — Immutable audit trail of state transitions across orders, print jobs, and lost items.
10. `assistant_conversations` — Private conversation inquiry threads linked to users.
11. `assistant_messages` — Grounded conversational turns, sources JSON, confidence scores, provider used, and timestamps.
12. `knowledge_documents` — Campus institutional knowledge registry with category, source reference, summary, key points, classification (`DEVELOPMENT_SAMPLE`, `PENDING_VERIFICATION`, `OFFICIAL_VERIFIED`, `RETIRED`), and verification metadata.
13. `knowledge_document_revisions` — Complete audit trail of knowledge document revisions, changelogs, and editor IDs.

---

## 4. API Endpoints Reference

### Authentication & Users
- `POST /api/v1/auth/login` — Authenticate and receive JWT token (rate-limited: 15 req/15min).
- `POST /api/v1/auth/register` — Student self-registration with academic credentials (rate-limited: 15 req/15min).
- `GET /api/v1/users` — Campus user directory (Admin only).
- `GET /api/v1/users/:id` — User profile (Owner or Admin).

### Campus Navigation
- `GET /api/v1/locations` — Browse locations with `category` and `search` filters.
- `GET /api/v1/locations/:id` — Single location details.
- `POST /api/v1/locations` — Create campus location (Admin only).
- `PUT /api/v1/locations/:id` — Update location details (Admin only).
- `PATCH /api/v1/locations/:id/status` — Toggle active status (Admin only).

### Canteen Pre-ordering
- `GET /api/v1/canteen/menu` — Live menu catalog with prices and availability.
- `POST /api/v1/canteen/orders` — Submit meal order with atomic server-side price calculation.
- `GET /api/v1/canteen/orders` — Student's personal order history.
- `GET /api/v1/canteen/orders/:id` — Order details with line items (Owner or Operator).
- `PATCH /api/v1/canteen/orders/:id/cancel` — Cancel placed order (Student owner).
- `GET /api/v1/canteen/operator/orders` — Kitchen queue with status filtering (Canteen Operator or Admin).
- `PATCH /api/v1/canteen/operator/orders/:id/status` — Advance order lifecycle (`accepted`, `preparing`, `ready`, `completed`, `rejected`).
- `POST /api/v1/canteen/menu` — Add menu item (Canteen Operator or Admin).
- `PATCH /api/v1/canteen/menu/:id/availability` — Toggle item availability (Canteen Operator or Admin).

### Xerox / Printing Hub
- `GET /api/v1/printing/specs` — Print service parameters, rate card, and counter location.
- `POST /api/v1/printing/requests` — Multipart upload (`document`, max 10MB) with print preferences.
- `GET /api/v1/printing/requests` — Student's print jobs list.
- `GET /api/v1/printing/requests/:id/download` — Secure document download (Request Owner or Printing Operator).
- `PATCH /api/v1/printing/requests/:id/cancel` — Cancel submitted job (Student owner).
- `GET /api/v1/printing/operator/queue` — Print queue with status filtering (Printing Operator or Admin).
- `PATCH /api/v1/printing/operator/requests/:id/status` — Advance print job status (`accepted`, `in_progress`, `ready`, `collected`, `rejected`).

### Lost & Found Registry
- `GET /api/v1/lost-found` — Browse campus registry with filters (`type`, `category`, `status`, `search`).
- `GET /api/v1/lost-found/:id` — Listing details (masks contact details for non-owners/non-admins).
- `POST /api/v1/lost-found` — Report lost or found property.
- `PUT /api/v1/lost-found/:id` — Edit listing (Reporter or Admin).
- `PATCH /api/v1/lost-found/:id/status` — Transition listing status (Reporter or Admin).
- `POST /api/v1/lost-found/:id/claim` — Submit private verification proof to Security Desk.

### AI Campus Assistant & Knowledge Base
- `GET /api/v1/assistant/conversations` — Student's conversation threads.
- `POST /api/v1/assistant/conversations` — Start a new inquiry thread.
- `GET /api/v1/assistant/conversations/:id` — Conversation message history (Owner or Admin).
- `POST /api/v1/assistant/conversations/:id/messages` — Send query, retrieve grounded answer with citations, and persist (rate-limited: 40 req/min).
- `DELETE /api/v1/assistant/conversations/:id` — Delete inquiry thread (Owner or Admin).
- `GET /api/v1/knowledge/stats` — Real database counts across document, location, and menu provenance (Admin only).
- `GET /api/v1/knowledge/documents` — Filtered knowledge document registry.
- `GET /api/v1/knowledge/documents/:id` — Single document detail with complete revision changelog.
- `POST /api/v1/knowledge/documents` — Onboard new circular/manual with `PENDING_VERIFICATION` state (Admin only).
- `PATCH /api/v1/knowledge/documents/:id/verify` — Approve & publish, reject, or retire document with auto-sync to FastAPI (Admin only).

---

## 5. Running the Application

### Option A: Local Development Setup

```bash
# 1. Database Initialization
cd server
npm run db:migrate
npm run db:seed

# 2. Database Backup & Restore Tooling
npm run db:backup   # Dumps all 13 tables to server/backups/
npm run db:restore  # Restores latest JSON backup into MySQL

# 3. Start Core Express Backend (Port 5001)
npm run dev

# 4. Start Python FastAPI AI Subsystem (Port 8000)
cd ../ai-service
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 5. Start React Frontend (Port 5173)
cd ../client
npm run dev
```

### Option B: Production Containerized Deployment (Docker Compose)

```bash
# Launch entire multi-container production simulation (MySQL, Node, FastAPI, Nginx)
docker-compose up --build -d

# Verify all containers are healthy
docker-compose ps
```

---

## 6. Automated Testing & Verification

```bash
# Run complete test suite (Phase 1, Phase 2, and Phase 3 - 63 passing tests)
npm test --prefix server

# Run concurrency and load performance simulation (25 concurrent orders + 25 AI queries)
node server/test/load_test.js
```

---

## 7. Demo Accounts (Baseline Credentials)

| Role | Email | Password | Assigned Scope |
|---|---|---|---|
| **Student** | `demo.student@campus.edu` | `StudentPass123!` | General student services |
| **Canteen Operator** | `demo.canteen@campus.edu` | `OperatorPass123!` | Kitchen queue & menu catalog |
| **Xerox Operator** | `demo.xerox@campus.edu` | `OperatorPass123!` | Print queue & document fulfillment |
| **Administrator** | `demo.admin@campus.edu` | `AdminPass123!` | Campus oversight, user directory, & data onboarding |
