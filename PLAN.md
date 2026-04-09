# Nova Board - Architecture Design

## 1. Project Overview

**Stack**: React + Vite (frontend) | Node.js + Express + Prisma + PostgreSQL (backend)
**Type**: Full-stack monorepo with shared types package
**Realtime**: WebSocket (ws library) for live collaboration

## 2. Monorepo Structure

```
nova-board/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Atomic design components
│   │   │   ├── atoms/          # Button, Input, Badge, Icon
│   │   │   ├── molecules/      # Card, Modal, Dropdown
│   │   │   └── organisms/      # KanbanBoard, IssueModal, Sidebar
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand state stores
│   │   ├── api/               # API client functions
│   │   ├── types/             # Shared TypeScript types (from common)
│   │   ├── utils/             # Helpers, formatters
│   │   ├── styles/            # Global styles, CSS variables
│   │   ├── pages/             # Route pages
│   │   └── App.tsx
│   └── index.html
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Database access layer
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── websocket/         # WebSocket handlers
│   │   ├── prisma/            # Prisma client + migrations
│   │   └── app.ts             # Express app setup
│   └── package.json
├── common/                    # Shared types between client/server
│   └── types/
│       └── index.ts           # Issue, Board, Column, User types
├── package.json                # Root workspace
└── README.md
```

## 3. Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatar    String?
  password  String   # Hashed
  createdAt DateTime @default(now())

  boards    BoardMember[]
  issues    Issue[]      @relation("assignee")
}

model Board {
  id        String   @id @default(cuid())
  name      String
  description String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  columns   Column[]
  members   BoardMember[]
}

model BoardMember {
  id      String @id @default(cuid())
  role    Role   @default(MEMBER)

  user    User   @relation(fields: [userId], references: [id])
  userId  String
  board   Board  @relation(fields: [boardId], references: [id])
  boardId String

  @@unique([userId, boardId])
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Column {
  id      String  @id @default(cuid())
  name    String
  order   Int

  board   Board   @relation(fields: [boardId], references: [id])
  boardId String
  issues  Issue[]

  @@unique([boardId, order])
}

model Issue {
  id          String    @id @default(cuid())
  title       String
  description String?
  priority    Priority  @default(MEDIUM)
  order       Int
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  column      Column    @relation(fields: [columnId], references: [id])
  columnId    String
  assignee    User?     @relation("assignee", fields: [assigneeId], references: [id])
  assigneeId  String?

  labels      Label[]
  subtasks    Subtask[]
  comments    Comment[]
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Label {
  id      String  @id @default(cuid())
  name    String
  color   String

  issues  Issue[]
}

model Subtask {
  id        String  @id @default(cuid())
  title     String
  completed Boolean @default(false)

  issue     Issue  @relation(fields: [issueId], references: [id])
  issueId   String
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())

  issue     Issue   @relation(fields: [issueId], references: [id])
  issueId   String
  author    User    @relation(fields: [authorId], references: [id])
  authorId  String
}
```

## 4. API Design

### Authentication
```
POST   /api/auth/register    { email, password, name } → { user, token }
POST   /api/auth/login       { email, password } → { user, token }
GET    /api/auth/me          → { user }
```

### Boards
```
GET    /api/boards                        → { boards[] }
POST   /api/boards                        { name, description? } → { board }
GET    /api/boards/:id                    → { board, columns, issues }
PATCH  /api/boards/:id                    { name?, description? } → { board }
DELETE /api/boards/:id                    → { success }
POST   /api/boards/:id/members           { userId, role } → { member }
```

### Columns
```
POST   /api/boards/:boardId/columns       { name } → { column }
PATCH  /api/columns/:id                  { name?, order? } → { column }
DELETE /api/columns/:id                  → { success }
POST   /api/boards/:boardId/columns/reorder { columnIds[] } → { columns[] }
```

### Issues
```
POST   /api/columns/:columnId/issues      { title, description?, priority?, assigneeId? } → { issue }
PATCH  /api/issues/:id                   { title?, description?, priority?, assigneeId?, dueDate? } → { issue }
PATCH  /api/issues/:id/move              { columnId, order } → { issue }
DELETE /api/issues/:id                   → { success }
```

### Labels
```
GET    /api/boards/:boardId/labels        → { labels[] }
POST   /api/boards/:boardId/labels        { name, color } → { label }
```

## 5. WebSocket Events

### Client → Server
```
join-board        { boardId }
leave-board       { boardId }
issue-move        { issueId, columnId, order }
cursor-move       { x, y }
```

### Server → Client
```
board-updated     { type, payload }
issue-updated     { issue }
issue-moved       { issueId, columnId, order }
user-joined       { user }
user-left         { userId }
presence-update   { users[] }
```

## 6. Frontend State Management (Zustand)

```typescript
// stores/authStore.ts - User session
// stores/boardStore.ts - Current board, columns, issues
// stores/uiStore.ts - Modals, drag state, theme
```

## 7. Component Architecture

### Atoms (reusable primitives)
- Button, Input, Textarea, Select, Badge, Avatar, Icon, Spinner, Tooltip

### Molecules (composed atoms)
- Card, Modal, Dropdown, Menu, Tabs, Breadcrumb, SearchInput, PriorityBadge

### Organisms (feature-specific)
- KanbanBoard, KanbanColumn, IssueCard, IssueModal, Sidebar, Header, BoardSettings

### Pages
- Login, Register, Dashboard (board list), BoardView (kanban)

## 8. Design System Tokens

```css
:root {
  /* Colors */
  --color-primary: #6366f1;      /* Indigo */
  --color-primary-hover: #4f46e5;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;

  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
}
```

## 9. Implementation Order

1. Project scaffolding (client + server + common)
2. Database schema + Prisma setup
3. Backend: Auth + Board CRUD APIs
4. Frontend: Design system + layout shell
5. Frontend: Kanban board with drag-and-drop
6. Frontend: Issue modal + CRUD
7. WebSocket real-time sync
8. Polish: animations, responsive, dark mode

## 10. Key Dependencies

**Frontend**: React 18, Vite, TypeScript, @dnd-kit, Zustand, React Query, React Router v6
**Backend**: Node.js, Express, Prisma, pg, jsonwebtoken, bcrypt, ws, zod
**Shared**: TypeScript, common types package
