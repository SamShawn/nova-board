import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const password = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@novaboard.dev' },
    update: {},
    create: {
      email: 'demo@novaboard.dev',
      name: 'Demo User',
      passwordHash: password,
    },
  })

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'nova-team' },
    update: {},
    create: {
      name: 'Nova Team',
      slug: 'nova-team',
      description: 'Demo workspace for NovaBoard',
      members: {
        create: { userId: user.id, role: 'ADMIN' },
      },
      labels: {
        create: [
          { name: 'bug', color: '#ef4444' },
          { name: 'feature', color: '#22c55e' },
          { name: 'urgent', color: '#f59e0b' },
          { name: 'documentation', color: '#6366f1' },
        ],
      },
    },
    include: { labels: true },
  })

  const project = await prisma.project.upsert({
    where: { workspaceId_key: { workspaceId: workspace.id, key: 'NOV' } },
    update: {},
    create: {
      name: 'NovaBoard',
      key: 'NOV',
      description: 'NovaBoard task management app',
      workspaceId: workspace.id,
      columns: {
        create: [
          { name: 'To Do', order: 0, color: '#71717a' },
          { name: 'In Progress', order: 1, color: '#f59e0b' },
          { name: 'In Review', order: 2, color: '#6366f1' },
          { name: 'Done', order: 3, color: '#22c55e' },
        ],
      },
    },
    include: { columns: true },
  })

  const [todoCol, inProgressCol] = project.columns

  const existingIssue = await prisma.issue.findFirst({
    where: { projectId: project.id, title: 'Set up authentication with NextAuth' },
  })

  if (!existingIssue) {
    const count = await prisma.issue.count({ where: { projectId: project.id } })
    await prisma.issue.create({
      data: {
        title: 'Set up authentication with NextAuth',
        description: 'Implement login, register, OAuth providers',
        priority: 'HIGH',
        columnId: inProgressCol.id,
        projectId: project.id,
        reporterId: user.id,
        order: count,
        issueNumber: count + 1,
      },
    })
  }

  const existingIssue2 = await prisma.issue.findFirst({
    where: { projectId: project.id, title: 'Design kanban board layout' },
  })

  if (!existingIssue2) {
    const count = await prisma.issue.count({ where: { projectId: project.id } })
    await prisma.issue.create({
      data: {
        title: 'Design kanban board layout',
        description: 'Create wireframes for board view',
        priority: 'MEDIUM',
        columnId: todoCol.id,
        projectId: project.id,
        reporterId: user.id,
        order: count,
        issueNumber: count + 1,
      },
    })
  }

  console.log('Seed complete: demo@novaboard.dev / password123')
}

main().catch(console.error)
