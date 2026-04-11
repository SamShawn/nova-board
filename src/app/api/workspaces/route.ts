import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      _count: { select: { projects: true, members: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(workspaces)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const slug = generateSlug(name)

  const existing = await prisma.workspace.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Workspace slug already exists' }, { status: 409 })
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      description,
      members: {
        create: { userId: session.user.id, role: 'ADMIN' },
      },
    },
    include: { members: { include: { user: true } } },
  })

  return NextResponse.json(workspace, { status: 201 })
}
