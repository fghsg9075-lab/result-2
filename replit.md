# IIC Annual Test 2026 - Student Marks Management System

## Overview

This is a student marks management application for tracking academic performance during the IIC Annual Test 2026 (Session 2025-26). The system allows administrators to manage students, subjects, and their corresponding marks, with features for ranking students based on performance percentages.

The application follows a full-stack TypeScript architecture with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion for smooth list transitions
- **Build Tool**: Vite

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Home, StudentDetails, NotFound)
- Reusable components in `client/src/components/`
- Custom hooks in `client/src/hooks/` for data fetching (students, marks)
- UI primitives in `client/src/components/ui/` (shadcn components)

### Backend Architecture
- **Framework**: Express 5 (TypeScript)
- **API Pattern**: RESTful JSON API with Zod validation
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL

The backend follows a layered architecture:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route handlers with typed contracts
- `server/storage.ts` - Database access layer (IStorage interface pattern)
- `server/db.ts` - Database connection pool
- `shared/schema.ts` - Drizzle table definitions and Zod schemas
- `shared/routes.ts` - API contract definitions shared between frontend and backend

### Data Model
Three main entities:
1. **Students** - id, rollNo (unique), name
2. **Subjects** - id, name, date, maxMarks
3. **Marks** - junction table linking students to subjects with obtained marks

Relationships are defined using Drizzle relations for eager loading student marks with subject details.

### Build System
- Development: Vite dev server with HMR, proxied through Express
- Production: esbuild bundles server code, Vite builds client to `dist/public`
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL** - Primary data store, connected via `DATABASE_URL` environment variable
- **pg** - Node.js PostgreSQL client
- **connect-pg-simple** - PostgreSQL session store (available but sessions not currently implemented)

### Third-Party Libraries
- **Drizzle ORM** - Type-safe database queries with PostgreSQL dialect
- **Zod** - Runtime schema validation for API inputs/outputs
- **drizzle-zod** - Auto-generate Zod schemas from Drizzle tables
- **date-fns** - Date formatting utilities
- **lucide-react** - Icon library

### Development Tools
- **Vite** - Frontend build and dev server
- **esbuild** - Server bundling for production
- **Drizzle Kit** - Database schema migrations
- **TypeScript** - Type checking across the stack

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal** - Error overlay in development
- **@replit/vite-plugin-cartographer** - Development tooling
- **@replit/vite-plugin-dev-banner** - Development environment indicator