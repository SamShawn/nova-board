# NovaBoard — Enterprise Task Management App

## Design Specification v1.0

---

## 1. Concept & Vision

NovaBoard is an enterprise-grade, responsive, cross-platform task management application that combines the structural depth of Jira with the visual elegance of Linear. Designed as a portfolio centerpiece, it showcases modern full-stack engineering (Next.js + Vercel), real-time collaboration architecture, and Linear-level UI polish — including motion design, micro-interactions, and premium dark/light theming.

The experience feels **fast, focused, and premium**. Every interaction communicates state clearly. Motion is purposeful, never decorative. The UI disappears and lets the work speak.

---

## 2. Design Language

### Aesthetic Direction
**Hybrid Light/Dark** — Light default with system-aware dark mode toggle. Inspired by Linear's minimal density, Notion's warmth, and Apple's attention to typographic hierarchy.

### Color Palette

**Light Mode:**
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#fafafa` | Page background |
| `--bg-secondary` | `#ffffff` | Card/panel surfaces |
| `--bg-tertiary` | `#f4f4f5` | Column backgrounds |
| `--border` | `#e4e4e7` | Dividers, card borders |
| `--text-primary` | `#18181b` | Headlines, body |
| `--text-secondary` | `#71717a` | Meta, labels |
| `--text-muted` | `#a1a1aa` | Placeholders |
| `--accent` | `#6366f1` | Primary actions, links (indigo) |
| `--accent-hover` | `#4f46e5` | Accent hover state |
| `--success` | `#22c55e` | Done column, success states |
| `--warning` | `#f59e0b` | In-progress, warnings |
| `--danger` | `#ef4444` | Errors, delete actions |

**Dark Mode:**
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#09090b` | Page background |
| `--bg-secondary` | `#18181b` | Card/panel surfaces |
| `--bg-tertiary` | `#27272a` | Column backgrounds |
| `--border` | `#3f3f46` | Dividers, card borders |
| `--text-primary` | `#fafafa` | Headlines, body |
| `--text-secondary` | `#a1a1aa` | Meta, labels |
| `--text-muted` | `#71717a` | Placeholders |
| `--accent` | `#818cf8` | Primary actions (lighter indigo) |
| `--accent-hover` | `#a5b4fc` | Accent hover state |

### Typography
- **Font:** `Inter` via `next/font` (Google Fonts — self-hosted, zero layout shift)
- **Headings:** 600 weight, tight letter-spacing (-0.02em)
- **Body:** 400 weight, 1.5 line-height
- **Mono:** `JetBrains Mono` for code snippets, issue IDs

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- Border radius: 6px (small), 8px (cards), 12px (modals), 16px (panels)

### Motion Philosophy
**Spring-based, 60fps, purposeful.** Animation communicates state — it never decorates.

| Interaction | Animation |
|-------------|-----------|
| Page transitions | Fade + subtle slide (200ms, ease-out) |
| Card hover | Subtle lift (translateY -2px) + shadow deepening (150ms, spring) |
| Card drag | Scale 1.02 + shadow elevation + 3% opacity |
| Modal open | Backdrop fade + scale from 0.96→1.0 (250ms, spring) |
| Button press | Scale 0.98 (100ms) |
| Column collapse | Height transition (200ms, ease-in-out) |
| Skeleton loading | Shimmer gradient sweep (1.5s, infinite) |
| Issue created | Fade + slide down from top (200ms, stagger 30ms) |
| Theme toggle | Cross-fade (300ms) |

### Visual Assets
- **Icons:** Lucide React — consistent 1.5px stroke weight
- **Avatars:** Gradient-based generated avatars for users without photos
- **Decorative:** Subtle gradient orbs on auth pages (CSS radial gradients, 5% opacity)

---

## 3. Layout & Structure

### Application Shell
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (64px collapsed / 240px expanded) │ Main Area   │
│  - Workspace switcher (top)               │  - Top bar  │
│  - Navigation links                         │  - Content  │
│  - User profile (bottom)                   │             │
└─────────────────────────────────────────────────────────┘
```

### Page Hierarchy
1. **`/`** → Redirect to `/dashboard` or `/login`
2. **`/login`** → Auth page (credentials + OAuth)
3. **`/register`** → Registration page
4. **`/dashboard`** → User's personal dashboard (assigned issues, recent activity)
5. **`/workspace/:slug`** → Workspace overview (project list)
6. **`/workspace/:slug/project/:projectId`** → Board view (kanban columns + issues)

### Responsive Strategy
- **Desktop (≥1280px):** Full sidebar + wide board
- **Tablet (768-1279px):** Collapsed sidebar (icon-only) + full board
- **Mobile (<768px):** Bottom navigation + single-column board view (swipe between columns)

---

## 4. Data Model

### Entity Relationship
```
Workspace
  ├── Project (many)
  │     ├── Column (many, ordered)
  │     │     └── Issue (many, ordered)
  │     │           ├── SubIssue (many, recursive)
  │     │           └── Comment (many)
  │     └── ProjectLabel (many, local labels)
  ├── WorkspaceLabel (many, shared labels)
  └── Member (many, with role)
        └── User
```

### Prisma Schema Entities

**User**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  passwordHash  String?
  accounts      Account[] // OAuth
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  memberships   WorkspaceMember[]
  assignedIssues Issue[]  @relation("Assignee")
  comments      Comment[]
}
```

**Workspace**
```prisma
model Workspace {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  members    WorkspaceMember[]
  projects    Project[]
  labels     WorkspaceLabel[]
}
```

**WorkspaceMember** (join table with role)
```prisma
model WorkspaceMember {
  id          String     @id @default(cuid())
  role        Role       @default(MEMBER) // ADMIN, MEMBER, VIEWER
  userId      String
  workspaceId String
  user        User       @relation(fields: [userId], references: [id])
  workspace   Workspace  @relation(fields: [workspaceId], references: [id])
  @@unique([userId, workspaceId])
}

enum Role {
  ADMIN
  MEMBER
  VIEWER
}
```

**Project**
```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  key         String   // e.g. "NOV" for issues like NOV-123
  description String?
  workspaceId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  columns     Column[]
  labels      ProjectLabel[]
  issues      Issue[]
}
```

**Column**
```prisma
model Column {
  id        String   @id @default(cuid())
  name      String
  order     Int
  color     String?  // e.g. "#22c55e" for "Done" green
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  issues    Issue[]
  @@index([projectId, order])
}
```

**Issue**
```prisma
model Issue {
  id          String    @id @default(cuid())
  issueNumber Int       @autoincrement // per-project sequential
  title       String
  description String?   // Markdown
  order       Int
  priority    Priority  @default(MEDIUM) // LOW, MEDIUM, HIGH, URGENT
  columnId    String
  projectId   String
  parentId    String?   // For sub-issues
  reporterId  String
  assigneeId  String?

  column     Column    @relation(fields: [columnId], references: [id], onDelete: Cascade)
  project    Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent     Issue?    @relation("SubIssues", fields: [parentId], references: [id])
  subIssues  Issue[]   @relation("SubIssues")
  reporter   User      @relation(fields: [reporterId], references: [id])
  assignee   User?      @relation("Assignee", fields: [assigneeId], references: [id])
  comments   Comment[]
  labels     IssueLabel[]

  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@unique([projectId, issueNumber])
  @@index([columnId, order])
  @@index([parentId])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

**Label** (shared workspace labels + project-local labels)
```prisma
model WorkspaceLabel {
  id          String    @id @default(cuid())
  name        String
  color       String    // Hex color
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  issues      IssueLabel[]
  @@unique([workspaceId, name])
}

model ProjectLabel {
  id        String   @id @default(cuid())
  name      String
  color     String
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  issues    IssueLabel[]
  @@unique([projectId, name])
}

model IssueLabel {
  issueId         String
  workspaceLabelId String?
  projectLabelId  String?
  issue           Issue         @relation(fields: [issueId], references: [id], onDelete: Cascade)
  workspaceLabel  WorkspaceLabel? @relation(fields: [workspaceLabelId], references: [id])
  projectLabel   ProjectLabel?   @relation(fields: [projectLabelId], references: [id])

  @@id([issueId, workspaceLabelId])
  @@id([issueId, projectLabelId])
}
```

**Comment**
```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String   // Markdown
  issueId   String
  userId    String
  issue     Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 5. API Design

### REST Endpoints (Next.js Route Handlers)

#### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account (credentials) |
| POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| GET | `/api/auth/session` | Get current session |

#### Workspaces
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspaces` | List user's workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces/:slug` | Get workspace details |
| PATCH | `/api/workspaces/:slug` | Update workspace |
| DELETE | `/api/workspaces/:slug` | Delete workspace |
| GET | `/api/workspaces/:slug/members` | List members |
| POST | `/api/workspaces/:slug/members` | Invite member |

#### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspaces/:slug/projects` | List projects |
| POST | `/api/workspaces/:slug/projects` | Create project |
| GET | `/api/workspaces/:slug/projects/:key` | Get project |
| PATCH | `/api/workspaces/:slug/projects/:key` | Update project |
| DELETE | `/api/workspaces/:slug/projects/:key` | Delete project |

#### Columns
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects/:key/columns` | Create column |
| PATCH | `/api/projects/:key/columns/:id` | Update column |
| DELETE | `/api/projects/:key/columns/:id` | Delete column |
| POST | `/api/projects/:key/columns/reorder` | Reorder columns |

#### Issues
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:key/issues` | List issues (filterable) |
| POST | `/api/projects/:key/issues` | Create issue |
| GET | `/api/projects/:key/issues/:number` | Get issue + sub-issues |
| PATCH | `/api/projects/:key/issues/:number` | Update issue |
| DELETE | `/api/projects/:key/issues/:number` | Delete issue |
| POST | `/api/projects/:key/issues/:number/move` | Move issue (column + order) |
| POST | `/api/projects/:key/issues/:number/sub-issues` | Add sub-issue |

#### Labels
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspaces/:slug/labels` | List workspace labels |
| POST | `/api/workspaces/:slug/labels` | Create workspace label |
| PATCH | `/api/workspaces/:slug/labels/:id` | Update workspace label |
| DELETE | `/api/workspaces/:slug/labels/:id` | Delete workspace label |
| POST | `/api/projects/:key/labels` | Create project label |
| DELETE | `/api/projects/:key/labels/:id` | Delete project label |

#### Comments
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:key/issues/:number/comments` | List comments |
| POST | `/api/projects/:key/issues/:number/comments` | Add comment |
| PATCH | `/api/comments/:id` | Edit comment |
| DELETE | `/api/comments/:id` | Delete comment |

### WebSocket Events (V2 Scope — Architecture in V1)
WebSocket server runs alongside Next.js (via custom server or Vercel compatible approach). Client subscribes to project channel.

**Client → Server:**
- `join_project` — Subscribe to project updates
- `leave_project` — Unsubscribe
- `move_issue` — Drag-drop with optimistic update
- `update_issue` — Field edit

**Server → Client:**
- `issue_created` — New issue broadcast
- `issue_updated` — Issue field changed
- `issue_moved` — Column/order changed
- `issue_deleted` — Issue removed
- `user_joined` — Presence indicator
- `user_left` — Presence indicator
- `comment_added` — New comment

---

## 6. Component Architecture

### Feature-Based Folder Structure
```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (app)/
│   │   ├── layout.tsx        # Authenticated layout (sidebar + topbar)
│   │   ├── dashboard/
│   │   └── workspace/
│   │       └── [slug]/
│   │           ├── page.tsx   # Workspace overview
│   │           └── [projectKey]/
│   │               └── page.tsx # Board view
│   └── api/
├── components/
│   ├── ui/                   # Primitives (Button, Input, Modal, Badge)
│   ├── board/                # Board-specific components
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── IssueCard.tsx
│   │   └── IssueModal.tsx
│   ├── layout/               # Sidebar, TopBar, WorkspaceSwitcher
│   └── auth/                 # Auth-specific components
├── features/
│   ├── auth/
│   │   ├── components/
│   │   └── hooks/useAuth.ts
│   ├── boards/
│   │   ├── components/
│   │   ├── hooks/useBoard.ts
│   │   └── stores/boardStore.ts
│   └── workspaces/
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── auth.ts              # NextAuth config
│   ├── websocket.ts         # WebSocket client (V2)
│   └── utils.ts
├── styles/
│   └── tokens.css           # CSS custom properties (design tokens)
└── types/
    └── index.ts             # Shared TypeScript types
```

### Component Design Principles
- **Server Components first** — Data-fetching components are Server Components by default; add `'use client'` only when needed for interactivity
- **Composition over nesting** — Flat component trees, props drill only when necessary
- **Zustand stores per feature** — Board state in `useBoardStore`, UI state in `useUIStore`
- **TanStack Query for server state** — `useQuery` / `useMutation` for all API calls

---

## 7. V1 Scope (Foundation + Core Board)

### Must Have (V1)
- [x] Auth: Register, login, logout (credentials + Google/GitHub OAuth)
- [x] Workspaces: Create, list, switch between workspaces
- [x] Projects: Create kanban project, default columns (To Do, In Progress, Done)
- [x] Columns: Add/edit/delete/reorder columns
- [x] Issues: Create/edit/delete issues, markdown description
- [x] Sub-issues: Add sub-issues to any issue (one level deep)
- [x] Drag-and-drop: Move issues between columns and reorder within column (@dnd-kit)
- [x] Labels: Workspace-level + project-level labels, assign to issues
- [x] Assignees: Assign issues to workspace members
- [x] Priority: Set issue priority (Low, Medium, High, Urgent)
- [x] Comments: Add/edit/delete comments on issues
- [x] Dark/Light mode: Toggle with system preference detection
- [x] Optimistic UI: Instant feedback on all mutations

### V1 WebSocket Architecture (Foundation)
- WebSocket client library initialized in V1 (but not connected to server yet)
- Event types defined and typed
- Hooks prepared for V2 WebSocket integration
- All board state updates go through Zustand store (easy to extend with WebSocket in V2)

---

## 8. V2 Scope (Real-time Collaboration)

- WebSocket server integration (custom Next.js server or Ably/Pusher)
- Live issue updates across clients
- Presence indicators (who's viewing the board)
- Live cursor/selection indicators
- Activity feed sidebar
- Real-time comment streaming

---

## 9. V3 Scope (Power Features)

- Advanced search (cmd+K modal, full-text search across issues)
- Bulk actions (multi-select + bulk move/label/delete)
- Keyboard shortcuts (j/k navigation, c to create, e to edit, / to search)
- Filter bar (by assignee, label, priority, text)
- Sort options (by priority, date, order)

---

## 10. V4 Scope (Design Award Territory)

- Full spring animation system (Framer Motion)
- Animated skeleton loading states
- Keyboard-driven navigation with focus rings
- Custom scrollbars matching theme
- Glassmorphism on modals and panels
- Subtle gradient mesh backgrounds
- Issue card flip/reveal animations
- WCAG AA accessibility audit
- Motion on every state transition

---

## 11. Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js App Router | Industry standard, SSR/SSG, API routes, Vercel-optimized |
| Styling | CSS Modules + CSS Variables | Full design control for Linear-level polish, no Tailwind bloat |
| State | Zustand (client) + TanStack Query (server) | Lean, TypeScript-first, separates client/server state |
| Drag-Drop | @dnd-kit | Modern, accessible, modular, actively maintained |
| Auth | NextAuth.js v5 | Credentials + OAuth, edge-compatible |
| Database | PostgreSQL + Prisma | Type-safe ORM, relational integrity |
| Real-time | WebSocket (V2 implementation) | Full-duplex, instant, scalable |
| Deployment | Vercel | Native Next.js support, edge functions, CI/CD |
| Icons | Lucide React | Consistent, tree-shakeable, open-source |
| Fonts | Inter (next/font) | Self-hosted, zero layout shift |

---

## 12. Out of Scope (Future Phases)

- Roadmaps / Gantt view
- Sprint planning / backlog
- Automations / rules engine
- Time tracking
- Wiki / documentation pages
- Mobile native apps
- AI features
- File attachments
- Email notifications
