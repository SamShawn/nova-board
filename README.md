# NovaBoard

Enterprise-grade task management inspired by Jira and Trello. Built as a portfolio project demonstrating full-stack React development with Next.js 16.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: NextAuth v5 (Credentials + Google + GitHub OAuth)
- **Database**: Prisma ORM with SQLite
- **State**: Zustand (client) + React Query (server)
- **Drag & Drop**: @dnd-kit
- **Styling**: CSS Modules with CSS custom properties
- **Icons**: Lucide React

## Features

- Multi-workspace support with role-based access (Admin, Member, Viewer)
- Kanban boards with drag-and-drop
- Issue tracking with priorities (Low, Medium, High, Urgent)
- Label system (workspace-level and project-level)
- Comments on issues
- Dark/light theme toggle
- OAuth and credentials authentication

## Getting Started

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated routes (dashboard, workspace)
│   ├── (auth)/            # Auth pages (login, register)
│   └── api/               # REST API routes
├── components/
│   ├── auth/              # Authentication components
│   ├── board/             # Kanban board components
│   ├── layout/            # Sidebar, TopBar
│   ├── providers/         # Theme, Query providers
│   └── ui/               # Reusable UI components
├── features/
│   ├── auth/             # Auth hooks
│   ├── boards/            # Board hooks and stores
│   └── workspaces/       # Workspace hooks
└── lib/                   # Auth, Prisma, utilities
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/workspaces` | List/create workspaces |
| GET/PATCH/DELETE | `/api/workspaces/[slug]` | Get/update/delete workspace |
| GET/POST | `/api/workspaces/[slug]/members` | List/add members |
| GET/POST | `/api/workspaces/[slug]/labels` | List/add labels |
| GET/POST | `/api/projects/[key]/issues` | List/create issues |
| PATCH/DELETE | `/api/projects/[key]/issues/[number]` | Update/delete issue |
| POST | `/api/projects/[key]/issues/[number]/move` | Move issue between columns |
| GET/POST | `/api/projects/[key]/issues/[number]/comments` | List/add comments |
| GET/POST | `/api/projects/[key]/labels` | List/add project labels |
| PATCH | `/api/comments/[id]` | Update comment |

## Authentication

Supports three auth methods:

1. **Credentials** - Email + password registration/login
2. **Google OAuth** - Sign in with Google
3. **GitHub OAuth** - Sign in with GitHub

Environment variables required:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## Data Model

- **Workspace** - Top-level organizational unit
- **Project** - Belongs to workspace, has unique key (e.g., "PROJ")
- **Column** - Kanban column within project (e.g., "To Do", "In Progress", "Done")
- **Issue** - Card within column, has number relative to project
- **Comment** - Attached to issue
- **Label** - Workspace-level or project-level tags
