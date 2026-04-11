import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[slug]/members - list members
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params

  const workspace = await prisma.workspace.findFirst({
    where: { slug, members: { some: { userId: session.user.id } } },
  })
  if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  })

  return NextResponse.json(members)
}

// POST /api/workspaces/[slug]/members - invite by email
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params

  const member = await prisma.workspaceMember.findFirst({
    where: { workspace: { slug }, userId: session.user.id, role: 'ADMIN' },
  })
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, role = 'MEMBER' } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const existing = await prisma.workspaceMember.findFirst({
    where: { workspace: { slug }, userId: user.id },
  })
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 })

  const workspace = await prisma.workspace.findUnique({ where: { slug } })
  if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const newMember = await prisma.workspaceMember.create({
    data: { workspaceId: workspace.id, userId: user.id, role },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  })

  return NextResponse.json(newMember, { status: 201 })
}
