# Student Finance Tracker

A full-stack, mobile-first finance web app for university students to track income, expenses, savings goals, and monthly reports.

## Tech Stack

- Frontend: Next.js 16 (App Router), React, Tailwind CSS
- Backend: Next.js Route Handlers (REST-style API)
- Database: PostgreSQL + Prisma ORM
- Auth: JWT (HTTP-only cookie) + bcrypt password hashing
- Charts: Recharts
- Export: CSV (PapaParse) + PDF (jsPDF + autoTable)

## Core Features

- Authentication: register/login/logout, password hashing, per-user data isolation
- Dashboard: total balance, total income/expenses, monthly summary, recent transactions
- Charts: expense categories pie chart + monthly spending trend line chart
- Transactions: create/read/update/delete + details page
- Categories: predefined + custom category management (create/edit/delete)
- Filters/Search: date range, category, type, and text search (title/notes)
- Savings Goals: create goals and track progress bars
- Reports: monthly report generation + CSV/PDF export
- Settings: username update, password change, currency selector, dark mode toggle
- Mobile UX: bottom navigation, floating action button, smooth page transitions
- Security: protected APIs, server-side validation, unauthorized access prevention

## Project Structure

```text
src/
  app/
    (auth)/                 # Login/Register pages
    (protected)/            # Dashboard, transactions, reports, settings pages
    api/                    # Route handlers (auth, transactions, categories, goals, reports, settings)
  components/
    auth/                   # Auth layout components
    categories/             # Category manager
    charts/                 # Recharts components
    dashboard/              # Dashboard-specific UI
    goals/                  # Savings goals UI
    layout/                 # Bottom nav, FAB, page transition container
    providers/              # App-level providers (theme/auth/toast)
    transactions/           # Transaction form/list/filter components
    ui/                     # Reusable UI primitives
  context/
    auth-context.tsx        # Client auth/session state
  lib/
    prisma.ts               # Prisma client singleton
    jwt.ts                  # JWT create/verify helpers
    server-auth.ts          # Cookie/session helpers
    validations.ts          # Zod schemas
    client-api.ts           # Typed fetch wrapper
    serializers.ts          # DB -> DTO mappers
    route-utils.ts          # Auth/validation route helpers
  types/
    index.ts                # Shared app DTO types
prisma/
  schema.prisma             # PostgreSQL schema
middleware.ts               # Route + API protection
```

## Environment Variables

Copy `.env.example` to `.env` and set values:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-random-secret"
```

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client

```bash
npm run prisma:generate
```

3. Run migrations (creates DB tables)

```bash
npm run prisma:migrate
```

4. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev`: start dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run ESLint
- `npm run prisma:generate`: generate Prisma client
- `npm run prisma:migrate`: run development migration
- `npm run prisma:push`: push schema to database without migration files
- `npm run prisma:studio`: open Prisma Studio

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET,POST /api/transactions`
- `GET,PATCH,DELETE /api/transactions/:id`
- `GET,POST /api/categories`
- `PATCH,DELETE /api/categories/:id`
- `GET,POST /api/goals`
- `PATCH,DELETE /api/goals/:id`
- `GET /api/dashboard`
- `GET /api/reports/monthly?month=YYYY-MM`
- `PATCH /api/settings/profile`
- `PATCH /api/settings/password`

## Deployment Notes

- Works on Vercel/Node environments with PostgreSQL.
- Set `DATABASE_URL` and `JWT_SECRET` in deployment environment variables.
- Run migrations during deployment (`npm run prisma:migrate`) before first production start.
