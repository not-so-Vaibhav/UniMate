# UniMate — Smart Campus Platform

> **An integrated smart-campus platform for students and campus service teams.**

UniMate consolidates essential campus workflows into a coherent, role-aware digital experience. The system is architected around five core modules:
1. **AI Campus Assistant** — Grounded campus inquiry support
2. **Campus Navigation** — Verified building, lecture hall, and facilities directory
3. **Canteen Pre-ordering** — Daily menus, pricing transparency, and meal pre-ordering
4. **Xerox / Printing** — Document reproduction and print fulfillment tracking
5. **Lost & Found** — Campus property reporting and recovery registry

---

## 1. Phase 1 Implementation Status: Foundation & Core Infrastructure

Phase 1 establishes the unified production foundation, database schema, role-based security, backend architecture, and premium design system:

| Layer | Technology | Status | Implementation Details |
|---|---|---|---|
| **Public Landing** | React 18 + Tailwind CSS | Completed | Premium public landing page at `/` with hero product mockup, five service highlights, interactive tab showcase, responsive mobile drawer, and auth-aware CTAs |
| **Frontend Shell** | React 18 + Vite + Tailwind CSS | Completed | Responsive application shell, Lucide icons, design tokens per `UI_UX.md`, protected routing |
| **State & Auth** | Context API + Axios Interceptors | Completed | Session persistence, JWT decoding, role-based view filtering, automated 401 handling |
| **Backend API** | Node.js + Express.js | Completed | Layered architecture (Controllers, Services, Routes, Middleware), centralized error handling |
| **Database** | MySQL Server (InnoDB, utf8mb4) | Completed | 9 normalized relational tables, foreign key constraints, indexes, automated migration & seed |
| **Authorization** | JWT + RBAC Middleware | Completed | Least-privilege role boundaries (`student`, `operator`, `admin`), record ownership protection |
| **AI Subsystem** | Python 3 + FastAPI | Ready | Independent service foundation with `/health` and `/api/v1/assistant/status` |
| **Verification** | Node.js Native Test Runner | Verified | 19/19 automated integration tests passing; client production build passes cleanly (0 errors) |

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
      [Layered: Routes -> Middleware -> Controllers -> Services]
           /                         \
          /                           \ (Internal Service Calls)
         v                             v
  MySQL Database (Port 3306)     Python + FastAPI AI Service (Port 8000)
  [9 Relational Tables]          [Prepared for Phase 2 Model Grounding]
```

---

## 3. Database Schema Overview

The relational database (`unimate_db`) includes 9 foundational tables:

1. `users` — Authentication identity, hashed passwords (bcrypt), assigned roles (`student`, `operator`, `admin`), and operator service assignments (`canteen`, `printing`).
2. `campus_locations` — Searchable campus locations with building, floor, category, and code.
3. `canteen_menu_items` — Food items with categories, prices, and availability flags.
4. `canteen_orders` — Student meal orders with order numbers, statuses, and totals.
5. `canteen_order_items` — Line items linking orders to menu items with unit prices and quantities.
6. `uploaded_files` — Private file metadata, storage paths, and MIME type validations.
7. `print_requests` — Xerox and printing requests with copies, paper layout, and operator assignment.
8. `lost_found_items` — Classified lost and found records linked to reporters and campus locations.
9. `status_history` — Comprehensive audit log of status transitions across orders and print jobs.

---

## 4. Getting Started & Local Development

### Prerequisites

- **Node.js**: v20+ and npm
- **MySQL**: v8.0+ or v9.x running locally on port 3306
- **Python**: v3.11+ (for AI service subsystem)

### 1. Environment Setup

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Review database credentials in `.env`:
```ini
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=unimate_db

JWT_SECRET=unimate_super_secure_jwt_dev_secret_key_2026
JWT_EXPIRES_IN=24h
```

### 2. Install Dependencies

Install root and workspace dependencies:

```bash
# Server dependencies
npm install --prefix server

# Frontend dependencies
npm install --prefix client
```

### 3. Initialize Database & Seed Baseline Accounts

Run the automated migration and seed scripts:

```bash
# Run schema migration (creates unimate_db and 9 tables)
npm run db:migrate --prefix server

# Seed verified development accounts and locations
npm run db:seed --prefix server
```

#### Pre-seeded Demo Accounts

| Role | Email | Password | Purpose |
|---|---|---|---|
| **Student** | `demo.student@campus.edu` | `StudentPass123!` | Accesses campus services and personal requests |
| **Canteen Operator** | `demo.canteen@campus.edu` | `OperatorPass123!` | Manages canteen orders and meal status |
| **Xerox Operator** | `demo.xerox@campus.edu` | `OperatorPass123!` | Manages document queue and printing requests |
| **Campus Admin** | `demo.admin@campus.edu` | `AdminPass123!` | Manages user directory and system oversight |

### 4. Running the Applications

#### Start Express Backend (Port 5001)
```bash
npm run dev --prefix server
# Endpoint: http://localhost:5001/api/v1/health
```

#### Start React Client (Port 5173)
```bash
npm run dev --prefix client
# App: http://localhost:5173/
```

#### Start FastAPI AI Subsystem (Port 8000, Optional for Phase 1)
```bash
cd ai-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
# Health: http://localhost:8000/health
```

---

## 5. Testing & Verification

Run the automated backend test suite:

```bash
npm test --prefix server
```

The test runner verifies:
- API health and MySQL connection status
- User login with bcrypt password comparison
- Bad request and invalid format rejection
- Duplicate registration prevention
- Role-based authorization (Student & Operator blocked from Admin endpoints)
- Record ownership verification

---

## 6. Project Roadmap

- **Phase 1 (Completed):** Foundation, Relational Database, Security/RBAC, Express Backend, React UI Shell, and Design System.
- **Phase 1.5 (Completed):** Premium Public-Facing Landing Page at `/` with responsive navigation, five service introductions, interactive showcase tour, architecture pillars, and auth-aware CTAs.
- **Phase 2 (Pending Owner Approval):** AI Assistant Grounding & Knowledge Corpus, Canteen Pre-ordering Flow, Xerox File Upload & Queue, Campus Navigation Search & Detail, and Lost & Found Reporting.
