import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import styles from './page.module.css'

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return notFound()

  const { slug } = await params

  const workspace = await prisma.workspace.findFirst({
    where: { slug, members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
      projects: { include: { _count: { select: { issues: true } } } },
    },
  })

  if (!workspace) return notFound()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.workspaceName}>{workspace.name}</h1>
          {workspace.description && <p className={styles.workspaceDesc}>{workspace.description}</p>}
        </div>
        <div className={styles.memberAvatars}>
          {workspace.members.slice(0, 5).map((m) => (
            <div key={m.user.id} className={styles.avatar} title={m.user.name || m.user.email}>
              {m.user.avatarUrl ? (
                <img src={m.user.avatarUrl} alt={m.user.name || ''} />
              ) : (
                <span>{(m.user.name || m.user.email || '?')[0].toUpperCase()}</span>
              )}
            </div>
          ))}
          {workspace.members.length > 5 && <div className={styles.avatarMore}>+{workspace.members.length - 5}</div>}
        </div>
      </div>

      <div className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <h2>Projects</h2>
          <Link href={`/workspace/${slug}/new`} className={styles.newProjectBtn}>New Project</Link>
        </div>
        <div className={styles.projectsGrid}>
          {workspace.projects.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No projects yet. Create your first project to get started.</p>
            </div>
          ) : (
            workspace.projects.map((project) => (
              <Link key={project.id} href={`/workspace/${slug}/${project.key}`} className={styles.projectCard}>
                <div className={styles.projectIcon}>
                  {project.name[0].toUpperCase()}
                </div>
                <div className={styles.projectInfo}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  <p className={styles.projectMeta}>{project.key} · {project._count.issues} issues</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
