import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ArrowRight } from 'lucide-react'
import styles from './page.module.css'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      projects: { take: 3 },
      _count: { select: { projects: true, members: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {session.user.name || 'there'}</p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Workspaces</h2>
          <Link href="/workspace/new" className={styles.newLink}>
            <Plus size={14} /> New Workspace
          </Link>
        </div>
        {workspaces.length === 0 ? (
          <div className={styles.empty}>
            <p>No workspaces yet. Create your first workspace to get started.</p>
          </div>
        ) : (
          <div className={styles.workspaceGrid}>
            {workspaces.map((ws) => (
              <Link key={ws.id} href={`/workspace/${ws.slug}`} className={styles.workspaceCard}>
                <div className={styles.wsName}>{ws.name}</div>
                <div className={styles.wsMeta}>
                  {ws._count.projects} projects · {ws._count.members} members
                </div>
                <ArrowRight size={14} className={styles.wsArrow} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
