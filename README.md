# 🎓 ProjectTrack — Academic Project Lifecycle Manager

A full-stack **PERN** (PostgreSQL, Express, React, Node.js) application that manages the complete lifecycle of academic projects — from student submission, through guide review and grading, to coordinator-level analytics.

---

## ✨ Features

### 👩‍🎓 Student
- Create and manage projects
- Add milestones and track completion %
- Upload submissions (with automatic version tracking)
- Submit projects for review
- Receive real-time notifications (approvals, grades, feedback)

### 👨‍🏫 Guide
- Review student submissions
- Give structured feedback (approve / reject / request changes)
- Grade projects (auto-converts score → letter grade)

### 👔 Coordinator
- Analytics dashboard: total projects, students, guides
- Status breakdown & department-wise stats
- Average grade tracking
- Delayed project monitoring

### 🔐 Cross-cutting
- **JWT authentication** with role-based access control (RBAC)
- **Audit trail** of every project status change
- **Event-driven notifications** (e.g. grading a project notifies the student)
- Versioned file uploads

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Tailwind CSS + React Router |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| File uploads | Multer |

---

## 📁 Project Structure

```
projecttrack/
├── backend/
│   ├── config/          # DB & multer config
│   ├── controllers/     # Request handlers (MVC)
│   ├── database/        # init.sql (schema)
│   ├── middleware/      # auth + role guards
│   ├── models/          # SQL queries / data layer
│   ├── routes/          # API route definitions
│   └── server.js        # Express entry point
└── frontend/
    └── src/
        ├── api/         # axios instance + token interceptor
        ├── components/  # DashboardLayout, StatCard
        └── pages/       # Login, Register, role dashboards
```

---

## 🗄️ Database Schema (11 tables)

`users`, `projects`, `project_status_history`, `milestones`, `submissions`, `submission_versions`, `feedbacks`, `discussion_threads`, `discussion_replies`, `notifications`, `grades`

Fully normalized with foreign-key constraints and status enums.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Clone the repo
```bash
git clone https://github.com/pokemon-uc/ProjectTrack.git
cd ProjectTrack
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=projecttrack
DB_PASSWORD=your_password_here
DB_PORT=5432
JWT_SECRET=your_secret_here
```

Create the database and load the schema:
```bash
psql -U postgres -c "CREATE DATABASE projecttrack;"
psql -U postgres -d projecttrack -f database/init.sql
```

Run the backend:
```bash
npm run dev        # runs on http://localhost:5000
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev        # runs on http://localhost:5173
```

> ⚠️ Run the backend and frontend in **two separate terminals**.

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | prisha@test.com | test123 |
| Guide | guide@test.com | test123 |
| Coordinator | coord@test.com | test123 |

Roles are read from the JWT — each account is routed to its own dashboard automatically.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/projects/mine` | Student's projects |
| POST | `/api/projects/:id/milestones` | Add milestone |
| POST | `/api/projects/:id/submissions` | Upload submission |
| POST | `/api/submissions/:id/feedback` | Guide gives feedback |
| POST | `/api/projects/:id/grade` | Guide grades project |
| GET | `/api/analytics/dashboard` | Coordinator analytics |
| GET | `/api/notifications` | User notifications |

---

## 👤 Author

**Prisha Kulkarni**  
Built as a full-stack PERN project demonstrating role-based access, relational data modeling, and event-driven workflows.
