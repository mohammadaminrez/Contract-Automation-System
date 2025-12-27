# Contract Automation System

A full-stack web application that automates the extraction and analysis of rental contract data using AI and pattern-matching techniques.

**🚀 Live Demo:** https://contract-automation-frontend.onrender.com/

## Overview

This system allows users to upload rental contracts (PDF or Word documents) and automatically extracts key information.

It supports two extraction methods: 

Fast regex-based pattern matching for Italian Unicampus contracts, and AI-powered universal extraction for any rental document in any language.

## Features

- **Document Upload**: Support for PDF and Word (.docx) documents
- **Dual Extraction Methods**:
  - **Regex**: Fast pattern-based extraction for Italian Unicampus contracts
  - **OpenAI**: AI-powered extraction for any rental document in any language
- **JSON Export**: Export extracted data in JSON format
- **Multi-language Support**: English and Italian interface (i18n)
- **Dark Mode**: Built-in theme switching
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend (NestJS)

- **Framework**: NestJS (Node.js/TypeScript)
- **Document Processing**:
  - `pdf-parse` - PDF text extraction
  - `mammoth` - Word document processing
- **AI Integration**:
  - `openai` (GPT-4o-mini)
- **Database**: Supabase (PostgreSQL)
- **File Upload**: Multer
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI ([Live API Docs](https://contract-automation-backend.onrender.com/api/docs))

### Frontend (Next.js)

- **Framework**: Next.js 14 (React/TypeScript)
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl (English/Italian)
- **UI Components**: Custom React components with dark mode support
- **API Communication**: Fetch API

### Infrastructure

- **Database**: Supabase (PostgreSQL with REST API)
- **Deployment**: Docker, Docker Compose, Render.com
- **Version Control**: Git/GitHub

## API Endpoints

### Contracts

- `POST /api/contracts/upload` - Upload a contract file
- `POST /api/contracts/:id/analyze?method=regex|openai` - Analyze contract
- `GET /api/contracts` - List all contracts
- `GET /api/contracts/:id` - Get contract details
- `DELETE /api/contracts/:id` - Delete contract
- `GET /api/contracts/:id/export` - Export contract data as JSON

### Health Check

- `GET /api/health` - Service health status

---

## GDPR Compliance & Privacy

**Issue:** System processes personal data (names, fiscal codes, addresses) and sends it to OpenAI without consent tracking or GDPR safeguards.

**Key requirements:**
- Add consent checkbox before upload + store consent records
- Display privacy notice when OpenAI extraction is selected
- Sign Data Processing Agreement with OpenAI (or use Azure OpenAI for EU data residency)
- Implement 90-day auto-deletion policy with cron job
- Add audit logs for all data access
- Optional: PII redaction (replace fiscal codes/emails with placeholders before sending to OpenAI)

---

## System Design — Production Considerations

### Multi-Client Support

Extend to multi-tenant architecture:
- Add `clients` and `users` tables
- Scope all queries by `client_id` for data isolation
- Implement JWT auth + role-based access (admin, manager, viewer)

### Automation Opportunities

- AI validation layer for inconsistent data
- Email reminders before payment due dates
- Human-in-the-loop review for low-confidence extractions
- Auto-categorize contracts by type

### Risks & Mitigations

**AI hallucinations:** OpenAI may extract incorrect rent amounts or dates. Mitigate with user confirmation workflows and confidence score thresholds that flag uncertain extractions for manual review.

**Financial errors:** Payment schedules could have wrong percentages or totals. Add validation rules ensuring installments sum to 100% and match the total rent amount.

**Scaling issues:** Large PDFs or high concurrent load can cause timeouts. Implement async job queues (Redis + Bull) to process extractions in the background without blocking user requests.

**Data leakage:** Sending personal data to OpenAI risks GDPR violations. Use PII redaction (replace fiscal codes/emails with placeholders before API calls) or switch to Azure OpenAI EU region for data residency compliance.

**Cost overruns:** Heavy OpenAI API usage can get expensive. Implement rate limiting per user and monthly quotas based on subscription tiers to control costs.

---

## References

- [ChatGPT Privacy Risks & GDPR Compliance](https://www.legalnodes.com/article/chatgpt-privacy-risks)

