import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params

  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId: session.user.id } },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
      projects: { include: { _count: { select: { issues: true } } } },
      labels: true,
    },
  })

  if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(workspace)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params

  const member = await prisma.workspaceMember.findFirst({
    where: { workspace: { slug }, userId: session.user.id, role: 'ADMIN' },
  })
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, description } = await req.json()
  const workspace = await prisma.workspace.update({
    where: { slug },
    data: { name, description },
  })
  return NextResponse.json(workspace)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params

  const member = await prisma.workspaceMember.findFirst({
    where: { workspace: { slug }, userId: session.user.id, role: 'ADMIN' },
  })
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.workspace.delete({ where: { slug } })
  return NextResponse.json({ success: true })
}
