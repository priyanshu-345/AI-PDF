# AI PDF Toolkit 📄🚀

Production-grade, AI-powered PDF Toolkit mobile application for Android built with React Native + Expo + TypeScript, backed by Node.js + Express, PostgreSQL with pgvector, Redis + BullMQ, and OpenAI RAG.

## 📌 Documentation & Blueprints
- **[Master Implementation Plan](file:///c:/Users/hp/Desktop/AI%20PDF/MASTER_IMPLEMENTATION_PLAN.md)**: Full architecture, database schema, file structure, feature catalog, and 12-phase execution guide.

## 🏗️ Monorepo Structure
- `apps/mobile`: React Native + Expo Android Application (Expo Router, NativeWind, React Native Paper)
- `apps/api`: Node.js + Express REST API Gateway (JWT, S3 presigned URLs, Rate Limiting)
- `apps/worker`: BullMQ Background Processing Service (PDF manipulation, Tesseract OCR, RAG vector indexing)
- `packages/database`: Prisma ORM client with PostgreSQL + pgvector schema
- `packages/shared`: Shared utilities, constants, error handling
- `packages/types`: Shared TypeScript definitions and API contracts

## 🚀 Quick Start
```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL, Redis & MinIO
docker compose -f docker/docker-compose.yml up -d

# 3. Setup Database Schema
pnpm db:push
pnpm db:generate

# 4. Start Development Servers
pnpm dev
```
