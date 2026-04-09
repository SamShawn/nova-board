# Nova Board

Enterprise Issue Tracking Platform — Trello meets Jira with world-class UI/UX.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + @dnd-kit + Zustand + React Query
- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL
- **Real-time**: WebSocket (ws)
- **Auth**: JWT

## Features (MVP)

- [x] User authentication (register/login)
- [x] Multi-board support
- [x] Kanban board with drag-and-drop
- [x] Issue CRUD (create, edit, delete)
- [x] Priority levels
- [x] Column management (add/rename/delete)
- [x] Real-time WebSocket updates
- [x] Responsive design
- [x] Design system with CSS variables

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp server/.env.example server/.env
# Edit server/.env with your database URL and JWT secret

# Set up database
npm run db:push --workspace=server
npm run db:seed --workspace=server

# Start development servers
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### Demo Credentials

```
Email: demo@novaboard.com
Password: demo123
```

## Project Structure

```
nova-board/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components (atomic design)
│   │   │   ├── atoms/      # Button, Input, Badge, Icons
│   │   │   ├── molecules/   # Modal, Card
│   │   │   └── organisms/  # KanbanBoard, Layout
│   │   ├── pages/         # Route pages
│   │   ├── stores/        # Zustand stores
│   │   ├── api/           # API client
│   │   └── styles/        # Global CSS
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/     # Auth, error handling
│   │   ├── prisma/        # Database client
│   │   └── websocket/     # WebSocket handlers
│   └── prisma/
│       └── schema.prisma  # Database schema
└── common/                  # Shared types
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

### Boards
- `GET /api/boards` - List boards
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board with columns/issues
- `PATCH /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Columns
- `POST /api/boards/:boardId/columns` - Add column
- `PATCH /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column
- `POST /api/boards/:boardId/columns/reorder` - Reorder columns

### Issues
- `POST /api/columns/:columnId/issues` - Create issue
- `PATCH /api/issues/:id` - Update issue
- `PATCH /api/issues/:id/move` - Move issue
- `DELETE /api/issues/:id` - Delete issue

## WebSocket Events

Client → Server:
- `join-board` - Join a board room
- `leave-board` - Leave a board room
- `issue-move` - An issue was moved

Server → Client:
- `board-updated` - Board was modified
- `issue-created` - New issue created
- `issue-updated` - Issue was modified
- `issue-moved` - Issue was moved
- `user-joined` - User joined board
- `user-left` - User left board

## TODO (Next Steps)

- [ ] List/Calendar/Gantt views
- [ ] Labels management UI
- [ ] Subtasks support
- [ ] Comments/activity
- [ ] File attachments
- [ ] Due date picker
- [ ] Search & filters
- [ ] Dark mode toggle
- [ ] User profile/settings
- [ ] Board settings/permissions UI
- [ ] Email notifications
- [ ] PWA offline support
