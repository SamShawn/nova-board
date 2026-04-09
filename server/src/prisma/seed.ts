import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@novaboard.com' },
    update: {},
    create: {
      email: 'demo@novaboard.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  console.log('✅ Created demo user:', user.email)

  // Create a sample board
  const board = await prisma.board.upsert({
    where: { id: 'seed-board-1' },
    update: {},
    create: {
      id: 'seed-board-1',
      name: 'Product Roadmap',
      description: 'Main product development board',
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
      columns: {
        create: [
          { id: 'col-todo', name: 'To Do', order: 0 },
          { id: 'col-progress', name: 'In Progress', order: 1 },
          { id: 'col-review', name: 'In Review', order: 2 },
          { id: 'col-done', name: 'Done', order: 3 },
        ],
      },
      labels: {
        create: [
          { id: 'label-bug', name: 'Bug', color: '#ef4444' },
          { id: 'label-feature', name: 'Feature', color: '#6366f1' },
          { id: 'label-enhancement', name: 'Enhancement', color: '#10b981' },
          { id: 'label-docs', name: 'Documentation', color: '#f59e0b' },
        ],
      },
    },
    include: { columns: true },
  })

  console.log('✅ Created board:', board.name)

  // Create sample issues
  const issues = [
    { title: 'Set up authentication system', description: 'Implement JWT-based auth with login/register', priority: 'HIGH' as const, columnId: 'col-progress', order: 0 },
    { title: 'Design database schema', description: 'Create Prisma schema for all entities', priority: 'HIGH' as const, columnId: 'col-done', order: 0 },
    { title: 'Build Kanban board UI', description: 'Implement drag-and-drop board with columns', priority: 'HIGH' as const, columnId: 'col-progress', order: 1 },
    { title: 'Add user dashboard', description: 'Create main dashboard with board list', priority: 'MEDIUM' as const, columnId: 'col-todo', order: 0 },
    { title: 'Implement WebSocket updates', description: 'Add real-time collaboration features', priority: 'MEDIUM' as const, columnId: 'col-todo', order: 1 },
    { title: 'Fix mobile responsiveness', description: 'Ensure board works on mobile devices', priority: 'LOW' as const, columnId: 'col-todo', order: 2 },
  ]

  for (const issue of issues) {
    await prisma.issue.upsert({
      where: { id: `issue-${issue.title.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `issue-${issue.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...issue,
        assigneeId: user.id,
      },
    })
  }

  console.log('✅ Created', issues.length, 'sample issues')
  console.log('')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Demo credentials:')
  console.log('  Email: demo@novaboard.com')
  console.log('  Password: demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
