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
    },
    include: { columns: true },
  })

  // Create labels
  const labels = await Promise.all([
    prisma.label.upsert({ where: { id: 'label-bug' }, update: {}, create: { id: 'label-bug', name: 'Bug', color: '#ef4444', boardId: board.id } }),
    prisma.label.upsert({ where: { id: 'label-feature' }, update: {}, create: { id: 'label-feature', name: 'Feature', color: '#6366f1', boardId: board.id } }),
    prisma.label.upsert({ where: { id: 'label-enhancement' }, update: {}, create: { id: 'label-enhancement', name: 'Enhancement', color: '#10b981', boardId: board.id } }),
    prisma.label.upsert({ where: { id: 'label-docs' }, update: {}, create: { id: 'label-docs', name: 'Documentation', color: '#f59e0b', boardId: board.id } }),
  ])

  console.log('✅ Created board:', board.name)
  console.log('✅ Created labels:', labels.length)

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
    const labelId = issue.title.toLowerCase().includes('fix') || issue.title.toLowerCase().includes('bug')
      ? 'label-bug'
      : issue.title.toLowerCase().includes('auth') || issue.title.toLowerCase().includes('design') || issue.title.toLowerCase().includes('build') || issue.title.toLowerCase().includes('implement') || issue.title.toLowerCase().includes('add')
        ? 'label-feature'
        : issue.title.toLowerCase().includes('docs') || issue.title.toLowerCase().includes('document')
          ? 'label-docs'
          : 'label-enhancement'

    await prisma.issue.upsert({
      where: { id: `issue-${issue.title.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `issue-${issue.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...issue,
        assigneeId: user.id,
        labels: { connect: { id: labelId } },
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
