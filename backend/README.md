# Contract Automation Backend

NestJS API for extracting structured data from rental contracts (PDF/Word) and generating payment schedules.

## Features

- ✅ PDF and Word document text extraction
- ✅ Pattern-based data extraction (Unicampus Italian contracts)
- ✅ Payment schedule generation (installments + single payment with discount)
- ✅ Multi-client support
- ✅ PostgreSQL database with JSONB (flexible schema)
- ✅ RESTful API with Swagger documentation
- ✅ TypeScript + NestJS architecture

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL (or Supabase account)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

## Environment Variables

Edit `.env` file:

```env
NODE_ENV=development
PORT=3001

# Supabase PostgreSQL
DATABASE_HOST=db.your-project.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=postgres

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

CORS_ORIGIN=http://localhost:3000
```

## Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Testing Task 1

After running `npm run start:dev`, test these endpoints:

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-24T16:00:00.000Z",
  "uptime": 12.345,
  "environment": "development"
}
```

### 2. API Info
```bash
curl http://localhost:3001/api
```

**Expected Response:**
```json
{
  "name": "Contract Automation API",
  "version": "1.0.0",
  "description": "Extract structured data from rental contracts and generate payment schedules",
  "documentation": "/api/docs"
}
```

### 3. Swagger Documentation
Open browser: http://localhost:3001/api/docs

You should see interactive API documentation.

## Project Structure

```
backend/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Health & info endpoints
│   └── app.service.ts       # Business logic
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── nest-cli.json            # NestJS CLI config
└── .env.example             # Environment template
```

## Next Tasks

- [ ] Task 2: Database schema + TypeORM entities
- [ ] Task 3: PDF/Word extraction service
- [ ] Task 4: Unicampus pattern extraction
- [ ] Task 5: Payment schedule generator
- [ ] Task 6: Contract upload & CRUD API

## Support

For issues or questions, see the main project README.
