# 🏗️ PlacementorAI – Architecture Overview

This document explains how PlacementorAI's components fit together. It's written for new contributors who want to understand the system before diving into the code.

---

## 🗺️ System Architecture Diagram

```mermaid
flowchart TD
    subgraph Users["👥 User Roles"]
        S([🎓 Student])
        R([🧑‍💼 Recruiter])
        A([🛡️ Admin])
    end

    subgraph Frontend["🖥️ Frontend  —  HTML / CSS / JS + Tailwind"]
        UI_S["student/\ndashboard · joblist · application · profile"]
        UI_R["recruiter/\ndashboard · postjob · manage-applicant"]
        UI_A["admin/\ndashboard · managejob · studentverify"]
        API_UTIL["js/utils/api.js\n(common API handler)"]
    end

    subgraph Backend["⚙️ Backend  —  Node.js + Express.js"]
        direction TB
        ROUTES["Routes\nauthRoutes · studentRoutes\nrecruiterRoutes · adminRoutes"]
        AUTH_MW["authMiddleware.js\nJWT Verification"]
        ROLE_MW["roleMiddleware.js\nRole-Based Access Control"]
        CTRL["Controllers\nauthController · studentController\nrecruiterController · adminController"]
        UTILS["utils/\njwt.js · response.js"]
    end

    subgraph AI["🤖 AI Guidance Layer  —  Advisory Only"]
        AI_CORE["Guidance Engine\n(resume · interview · career tips)"]
    end

    subgraph DB["🗄️ Database  —  MongoDB + Mongoose"]
        M_USER["User.js"]
        M_STU["Student.js"]
        M_REC["Recruiter.js"]
        M_JOB["Job.js"]
        M_APP["Application.js"]
    end

    %% User → Frontend
    S --> UI_S
    R --> UI_R
    A --> UI_A

    %% Frontend → Backend
    UI_S & UI_R & UI_A --> API_UTIL
    API_UTIL -->|"HTTP Requests"| ROUTES

    %% Backend internal flow
    ROUTES --> AUTH_MW --> ROLE_MW --> CTRL
    CTRL --> UTILS

    %% Backend → DB
    CTRL -->|"Mongoose ODM"| M_USER & M_STU & M_REC & M_JOB & M_APP

    %% AI advisory (read-only, no DB writes)
    UI_S & UI_R -.->|"AI guidance requests"| AI_CORE
    AI_CORE -.->|"Advice only — no data stored"| UI_S & UI_R

    %% Styling
    classDef userNode fill:#4f46e5,color:#fff,stroke:none,rx:20
    classDef feNode fill:#0ea5e9,color:#fff,stroke:none
    classDef beNode fill:#059669,color:#fff,stroke:none
    classDef aiNode fill:#d97706,color:#fff,stroke:none
    classDef dbNode fill:#7c3aed,color:#fff,stroke:none

    class S,R,A userNode
    class UI_S,UI_R,UI_A,API_UTIL feNode
    class ROUTES,AUTH_MW,ROLE_MW,CTRL,UTILS beNode
    class AI_CORE aiNode
    class M_USER,M_STU,M_REC,M_JOB,M_APP dbNode
```

---

## 🧱 Layer-by-Layer Breakdown

### 1. 👥 User Roles
Three distinct roles, each with a strictly scoped set of permissions:

| Role | Can Do | Cannot Do |
|---|---|---|
| **Student** | Apply to jobs, manage profile, get AI guidance | Update/delete applications |
| **Recruiter** | Post jobs, manage applicants, get AI guidance | Apply to jobs |
| **Admin** | Approve jobs, verify users, view metrics | Create or modify applications |

---

### 2. 🖥️ Frontend — `frontend/`
Plain HTML/CSS/JS with Tailwind CSS. Each role has its own folder with dedicated pages.

- **`index.html`** — Public landing page  
- **`login.html` / `register.html`** — Auth entry points  
- **`js/utils/api.js`** — Central fetch helper; all API calls go through here (attach JWT token, handle errors consistently)

---

### 3. ⚙️ Backend — `backend/`
Node.js + Express.js REST API. Every request passes through two middleware layers before reaching a controller.

**Request lifecycle:**
```
Route → authMiddleware (JWT check) → roleMiddleware (role check) → Controller → DB
```

- **`app.js`** — Mounts all routes and global middleware  
- **`server.js`** — Entry point, starts the HTTP server  
- **`config/db.js`** — MongoDB connection  
- **`utils/response.js`** — Standardised API response shape across all endpoints  

---

### 4. 🔐 Auth & Middleware — `middlewares/`
Two files, always used together:

| File | Purpose |
|---|---|
| `authMiddleware.js` | Verifies the JWT token on every protected route |
| `roleMiddleware.js` | Checks the decoded role matches the required role for that route |

Token utilities (sign, verify) live in `utils/jwt.js`.

---

### 5. 🗄️ Database — MongoDB + Mongoose — `models/`

| Model | Stores |
|---|---|
| `User.js` | Shared auth fields (email, password hash, role) |
| `Student.js` | CGPA, branch, skills, resume link |
| `Recruiter.js` | Company info, posted jobs |
| `Job.js` | Job details, approval status |
| `Application.js` | Student–Job link + status (Pending / Shortlisted / Rejected) |

---

### 6. 🤖 AI Guidance Layer
Advisory only — the AI never writes to the database or makes decisions.

- Provides resume tips, interview prep, and career advice to Students and Recruiters  
- Communicates only with the frontend; no backend routes are involved  
- Cannot log users in, apply to jobs, or shortlist/reject candidates  

---

## 📂 Key Files for New Contributors

| What you're working on | Start here |
|---|---|
| Adding a new API endpoint | `routes/` → `controllers/` → `models/` |
| Changing access rules | `middlewares/roleMiddleware.js` |
| Modifying the database schema | `models/` |
| Frontend UI for a role | `frontend/<role>/` |
| How the frontend talks to the API | `frontend/js/utils/api.js` |
| Environment / config | `backend/config/env.js` + `.env` |
| Server startup & middleware order | `backend/app.js` → `backend/server.js` |

---

## ⚙️ Local Setup (Quick Reference)

```bash
# 1. Clone the repo
git clone <repo-url>

# 2. Set up environment variables
cp .env.example backend/.env
# Fill in MONGO_URI, JWT_SECRET, PORT=5000

# 3. Install and run backend
cd backend
npm install
npm run dev
# → http://localhost:5000

# 4. Open frontend
# Open frontend/index.html directly in your browser
```

---

> **Core rule to remember while contributing:**  
> Students **create** applications · Recruiters **update** status · Admins **observe and approve**  
> Keep this separation intact in every feature you build.
