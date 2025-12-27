# Contract Automation System

A full-stack web application that automates the extraction and analysis of rental contract data using AI and pattern-matching techniques.

**🚀 Live Demo:** https://contract-automation-frontend.onrender.com/

## Overview

This system allows users to upload rental contracts (PDF or Word documents) and automatically extracts key information such as tenant details, financial terms, payment schedules, and contract dates. It supports two extraction methods: fast regex-based pattern matching for Italian Unicampus contracts, and AI-powered universal extraction for any rental document in any language.

## Features

- **Document Upload**: Support for PDF and Word (.docx) documents
- **Dual Extraction Methods**:
  - **Regex**: Fast pattern-based extraction for Italian Unicampus contracts
  - **OpenAI**: AI-powered extraction for any rental document in any language
- **Data Extraction**: Automatically extracts tenant info, financial details, dates, and more
- **Payment Schedule Generation**: Creates structured payment plans from contract data
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

## GDPR Compliance for OpenAI Integration

This system processes sensitive personal data from rental contracts (names, fiscal codes, addresses, financial details) and sends it to OpenAI's GPT-4o-mini API when using AI extraction.

### Legal Basis & Consent

**Current gap:** No consent tracking or legal basis documentation.

**Required changes:**
- Add consent checkbox during upload confirming users have the right to process the data and agree to AI analysis
- Store consent records with timestamps and IP addresses in the database
- For B2B use cases, document "legitimate interests" as the legal basis in a Data Protection Impact Assessment (DPIA)

### User Control & Transparency

**Missing features:**
- Users can't withdraw consent after uploading
- No information about what happens when data goes to OpenAI
- Can't switch between extraction methods after upload

**Needed implementations:**
- "Delete my data" button that removes both database records and uploaded files
- Clear modal when selecting OpenAI: "This sends contract text to OpenAI servers in the USA. Data is encrypted in transit, not used for training, and deleted after 30 days."
- Privacy policy update mentioning OpenAI as sub-processor, data transfers to USA, retention periods, and user rights
- Audit trail logging all consent decisions

### GDPR Data Subject Rights

**Right to Access:** Already supported via JSON export button

**Right to Erasure:** Delete endpoint works for local data, but can't force OpenAI deletion (their API auto-deletes after 30 days anyway)

**Right to Rectification:** Need to add ability to edit extracted data after processing

**Right to Data Portability:** Already works through JSON export

**Right to Object:** Users can choose regex-only extraction to avoid AI processing

### Age Verification

For student housing contracts, implement one of:
- Checkbox confirming no minors under 16 are involved
- Auto-detect birth dates indicating minors and flag for review
- Parental consent workflow for verified minors

Since this is B2B software (property managers, not tenants directly), age verification is lower priority but should be documented in terms of service.

### OpenAI Data Processing Agreement

**Critical step:** Sign OpenAI's DPA with Standard Contractual Clauses for legal data transfers to the USA.

**Alternative:** Switch to Azure OpenAI Service for EU data residency. Azure OpenAI keeps all data within EU regions and offers better GDPR compliance tools. Requires changing the OpenAI client initialization in `openai-extraction.service.ts` to point to Azure endpoints.

### Data Minimization & PII Redaction

**Current issue:** Entire contract text goes to OpenAI, including potentially irrelevant sections.

**Improvements needed:**
- Pre-process documents to send only first 3 pages (usually contains all needed data)
- Implement PII redaction before OpenAI: replace fiscal codes, emails, and names with placeholders like `FISCAL_1`, `EMAIL_1`, then restore them after extraction
- This way OpenAI never sees actual personal identifiers while still extracting structured data

**Purpose limitation:** Only use extracted data for contract management, not marketing or other purposes.

### Data Protection Impact Assessment (DPIA)

GDPR requires DPIA when using AI that processes personal data. Document:

1. **Data processed:** Names, addresses, fiscal codes, financial data
2. **Purpose:** Automate manual data entry, reduce errors
3. **Risks:** Data breach at OpenAI, AI hallucinations, unauthorized file access
4. **Mitigations:** TLS encryption, confidence scoring, access logs, 90-day retention, regex alternative
5. **Residual risk:** Acceptable for business use with informed consent

Keep this internally - you don't need to publish it, but have it ready if data protection authorities ask.

### Retention & Auto-Deletion

**Current state:** Contracts stored indefinitely.

**GDPR requirement:** Implement automatic deletion after defined period.

Add database fields for retention period (default 90 days) and scheduled deletion date. Run daily cron job to auto-delete expired contracts including both database records and uploaded files. Let clients configure retention based on their legal requirements (some need 1 year, others want 30 days).

### Audit Logging

Create audit log table tracking contract access. Log every view, export, download, and deletion with user ID, IP address, and timestamp. Required for demonstrating GDPR compliance during audits.

