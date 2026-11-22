# UniMate — Smart Campus Platform

> **An integrated smart-campus platform for students and campus service teams.**

UniMate consolidates essential campus workflows into a coherent, role-aware digital experience. The system is architected around five core modules:
1. **AI Campus Assistant** — Grounded campus inquiry support strictly backed by verified university circulars
2. **Campus Navigation** — Verified building, lecture hall, and facilities directory
3. **Canteen Pre-ordering** — Daily menus, pricing transparency, and meal pre-ordering with kitchen queue
4. **Xerox / Printing** — Secure document upload, print specifications, and fulfillment tracking
5. **Lost & Found** — Campus property reporting, privacy-protected claims, and security desk registry

---

## 1. Implementation Status

UniMate has completed **Phase 1 (Foundation & Security Hardening)**, **Phase 1.5 (Public Landing Page)**, and **Phase 2 (Complete Core Module Development)**:

| Layer / Workstream | Technology | Status | Implementation Details |
|---|---|---|---|
| **Public Landing Page** | React 18 + Tailwind CSS | Completed | Professional public landing page at `/` with hero product preview, five service showcase cards, interactive tab selector, and role-aware navigation |
| **Frontend Core** | React 18 + Vite + Tailwind CSS | Completed | Full-featured UI for all 5 modules, responsive navigation drawer, toast feedback, modal drawers, and zero fabricated numbers |
| **State & Auth** | Context API + Axios Interceptors | Completed | Session persistence, JWT decoding, role-based route guards, least-privilege view isolation |
| **Backend Core** | Node.js + Express.js | Completed | Layered architecture (Controllers, Routes, Middleware), centralized error handling, multipart file uploads |
| **Database** | MySQL Server (InnoDB, utf8mb4) | Completed | 11 relational tables, strict foreign keys, composite indexes, atomic transaction orders |
| **Workstream 1: Navigation** | Express + React + MySQL | Completed | Location search, category filters, Admin location creation, editing, and status toggling |
| **Workstream 2: Canteen** | Express + React + MySQL | Completed | Menu catalog with INR prices, server-side transaction total calculation, order cancellation, kitchen queue, operator lifecycle |
| **Workstream 3: Printing** | Multer + Express + React | Completed | Secure multipart upload (PDF, DOCX <= 10MB) to private storage, page specification calculator, authorized file download, operator queue |
| **Workstream 4: Lost & Found** | Express + React + MySQL | Completed | Reporting workflow, privacy protection for reporter contact details, security claim submission, admin status management |
| **Workstream 5: AI Assistant** | Python FastAPI + Express | Completed | Knowledge retrieval engine grounded in 10 verified campus circulars/manuals, strict non-hallucination threshold, source citations, conversation persistence |
| **Workstream 6: Integration** | React Dashboard & Admin | Completed | Real-time cross-module dashboard with active order chips, print tickets, security reports, and admin console tabs |
| **Automated Testing** | Node.js Native Test Runner | Verified | 40/40 tests passing (19 Phase 1 security/auth tests + 21 Phase 2 module tests) |

---

## 2. High-Level Architecture

```text
Student / Service Operator / Campus Admin
                  |
                  v
       React + Vite SPA (Port 5173)
       [Tailwind CSS, React Router, Axios, Lucide]
                  |
                  | REST API (JWT Bearer Token)
                  v
       Node.js + Express API (Port 5001)
       [Layered: Routes -> Middleware -> DB Pool -> File Storage]
            /                         \
           /                           \ (HTTP Internal API Proxy)
          v                             v
   MySQL Database (Port 3306)     Python + FastAPI AI Service (Port 8000)
   [11 Relational Tables]         [Retriever + Grounded Campus Corpus]
```

---

## 3. Database Schema Overview

The relational database (`unimate_db`) includes 11 relational tables:

1. `users` — Authentication identity, hashed passwords (bcrypt), assigned roles (`student`, `operator`, `admin`), and operator service assignments (`canteen`, `printing`).
2. `campus_locations` — Searchable campus locations with building, floor, category, and code.
3. `canteen_menu_items` — Food items with categories, prices in INR (₹), and availability flags.
4. `canteen_orders` — Student meal orders with order numbers (`ORD-YYYYMMDD-XXXX`), lifecycle statuses, and server-calculated totals.
5. `canteen_order_items` — Relational line items for canteen orders with quantity and unit price.
6. `uploaded_files` — Secure file registry storing metadata, original filename, randomized storage path, and ownership.
7. `print_requests` — Print submissions with specifications (`color_mode`, `print_type`, `pages`, `copies`, `binding`) and tracking numbers (`PRT-YYYYMMDD-XXXX`).
8. `lost_found_items` — Misplaced and recovered items with privacy protection and status tracking.
9. `status_history` — Immutable audit trail of state transitions across orders, print jobs, and lost items.
10. `assistant_conversations` — Private conversation inquiry threads linked to users.
11. `assistant_messages` — Grounded conversational turns, sources JSON, and timestamp records.

---

## 4. API Endpoints Reference

### Authentication & Users
- `POST /api/v1/auth/login` — Authenticate and receive JWT token.
- `POST /api/v1/auth/register` — Student self-registration with academic credentials.
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
- `POST /api/v1/canteen/orders/:id/cancel` — Cancel placed order (Student owner).
- `GET /api/v1/canteen/operator/orders` — Kitchen queue with status filtering (Canteen Operator or Admin).
- `PATCH /api/v1/canteen/operator/orders/:id/status` — Advance order lifecycle (`accepted`, `preparing`, `ready`, `completed`, `rejected`).
- `POST /api/v1/canteen/menu` — Add menu item (Canteen Operator or Admin).
- `PATCH /api/v1/canteen/menu/:id/availability` — Toggle item availability (Canteen Operator or Admin).

### Xerox / Printing Hub
- `GET /api/v1/printing/specs` — Print service parameters, rate card, and counter location.
- `POST /api/v1/printing/requests` — Multipart upload (`document`, max 10MB) with print preferences.
- `GET /api/v1/printing/requests` — Student's print jobs list.
- `GET /api/v1/printing/requests/:id/download` — Secure document download (Request Owner or Printing Operator).
- `POST /api/v1/printing/requests/:id/cancel` — Cancel submitted job (Student owner).
- `GET /api/v1/printing/operator/queue` — Print queue with status filtering (Printing Operator or Admin).
- `PATCH /api/v1/printing/operator/requests/:id/status` — Advance print job status (`accepted`, `in_progress`, `ready`, `collected`, `rejected`).

### Lost & Found Registry
- `GET /api/v1/lost-found` — Browse campus registry with filters (`type`, `category`, `status`, `search`).
- `GET /api/v1/lost-found/:id` — Listing details (masks contact details for non-owners/non-admins).
- `POST /api/v1/lost-found` — Report lost or found property.
- `PUT /api/v1/lost-found/:id` — Edit listing (Reporter or Admin).
- `PATCH /api/v1/lost-found/:id/status` — Transition listing status (Reporter or Admin).
- `POST /api/v1/lost-found/:id/claim` — Submit private verification proof to Security Desk.

### AI Campus Assistant
- `GET /api/v1/assistant/conversations` — Student's conversation threads.
- `POST /api/v1/assistant/conversations` — Start a new inquiry thread.
- `GET /api/v1/assistant/conversations/:id` — Conversation message history (Owner or Admin).
- `POST /api/v1/assistant/conversations/:id/messages` — Send query, retrieve grounded answer with citations, and persist.
- `DELETE /api/v1/assistant/conversations/:id` — Delete inquiry thread (Owner or Admin).

---

## 5. Running the Application

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MySQL Server (v8.0+)

### Setup Commands

```bash
# 1. Database Initialization
cd server
npm run db:migrate
npm run db:seed
node src/db/phase2_migration.js

# 2. Start Core Express Backend (Port 5001)
npm run dev

# 3. Start Python FastAPI AI Service (Port 8000)
cd ../ai-service
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 4. Start React Frontend (Port 5173)
cd ../client
npm run dev
```

### Running Automated Test Suites

```bash
# Run complete test suites (Phase 1 Security + Phase 2 Core Modules)
cd server
npm test                     # Runs Phase 1 security & RBAC tests (19 passing)
node --test test/phase2.test.js # Runs Phase 2 core module tests (21 passing)
```

---

## 6. Demo Accounts (Baseline Credentials)

| Role | Email | Password | Assigned Scope |
|---|---|---|---|
| **Student** | `demo.student@campus.edu` | `StudentPass123!` | General student services |
| **Canteen Operator** | `demo.canteen@campus.edu` | `OperatorPass123!` | Kitchen queue & menu catalog |
| **Xerox Operator** | `demo.xerox@campus.edu` | `OperatorPass123!` | Print queue & document fulfillment |
| **Administrator** | `demo.admin@campus.edu` | `AdminPass123!` | Campus oversight & user directory |
