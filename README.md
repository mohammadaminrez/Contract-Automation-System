# Contract Automation System

Full-stack application for extracting structured data from Italian rental contracts (PDF/Word) and generating payment schedules.

## 🎯 Project Overview

This system automates the extraction of contract data from Unicampus Apartments rental agreements and generates payment schedules with support for:
- 3-installment payment plans (40%, 30%, 30%)
- Single payment option with 3% discount
- Security deposit tracking
- Multi-client contract management

## 🏗️ Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Next.js    │ ───> │   NestJS     │ ───> │  PostgreSQL  │
│   Frontend   │      │   Backend    │      │  (Supabase)  │
└──────────────┘      └──────────────┘      └──────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** TypeORM
- **File Processing:** pdf-parse, mammoth.js
- **API Docs:** Swagger/OpenAPI
- **Deployment:** Docker, AWS Lambda

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React + TypeScript + Tailwind CSS
- **i18n:** next-intl (Italian/English)
- **API Client:** Axios

## 📋 Features

✅ Upload PDF or Word rental contracts
✅ Automatic data extraction (pattern-based)
✅ Payment schedule generation (2 options)
✅ Multi-client support
✅ Contract history and management
✅ Multi-language UI (Italian/English)
✅ RESTful API with Swagger docs
✅ Docker deployment
✅ AWS Lambda ready

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- PostgreSQL or Supabase account
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Contract-Automation-System

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# Install frontend dependencies
cd ../frontend
npm install
cp .env.example .env
# Edit .env with backend API URL
```

### Running Locally

```bash
# Terminal 1: Start backend
cd backend
npm run start:dev
# Backend runs on http://localhost:3001

# Terminal 2: Start frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### Testing

Visit:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **API Docs:** http://localhost:3001/api/docs
- **Health Check:** http://localhost:3001/api/health

## 📁 Project Structure

```
Contract-Automation-System/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── clients/         # Client management
│   │   ├── contracts/       # Contract CRUD
│   │   ├── parser/          # PDF/Word extraction
│   │   ├── payments/        # Payment schedules
│   │   └── database/        # TypeORM entities
│   ├── uploads/             # Uploaded files
│   └── package.json
│
├── frontend/                 # Next.js App
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   ├── components/      # React components
│   │   └── lib/             # API client
│   └── package.json
│
├── docker-compose.yml        # Docker setup
├── serverless.yml            # AWS Lambda config
└── README.md
```

## 🔧 Development Workflow

### Task-Based Development

This project is being built in incremental tasks:

- [x] **Task 1:** NestJS backend setup ← **YOU ARE HERE**
- [ ] **Task 2:** Database schema + TypeORM
- [ ] **Task 3:** PDF/Word extraction service
- [ ] **Task 4:** Unicampus pattern extraction
- [ ] **Task 5:** Payment schedule generator
- [ ] **Task 6:** Contract upload & CRUD API
- [ ] **Task 7:** Next.js frontend setup
- [ ] **Task 8:** Contract list & detail views
- [ ] **Task 9:** i18n support
- [ ] **Task 10:** Docker configuration
- [ ] **Task 11:** AWS Lambda deployment
- [ ] **Task 12:** Documentation

Each task is tested independently before moving to the next.

## 📖 API Documentation

After starting the backend, visit:
**http://localhost:3001/api/docs**

Interactive Swagger UI with all endpoints documented.

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Services:
# - Backend: http://localhost:3001
# - Frontend: http://localhost:3000
# - PostgreSQL: localhost:5432
```

## ☁️ AWS Lambda Deployment

```bash
cd backend
npm run deploy:lambda
```

## 🌍 Supported Contract Formats

Currently supports:
- ✅ **Unicampus Apartments** Italian rental contracts
- ✅ Format: "CONTRATTO DI OSPITALITÀ E ALLOGGIO"

### Adding More Formats

To support additional templates, add extraction patterns in:
`backend/src/parser/patterns/`

See backend README for details.

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📝 License

MIT

## 👤 Author

Mars

---

**Status:** Task 1 Complete ✅
**Next:** Database schema setup (Task 2)
