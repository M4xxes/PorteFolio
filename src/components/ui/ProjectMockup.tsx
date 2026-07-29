import type { Project } from '@/types'

function MockupSurface({ project }: { project: Project }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${project.accentFrom}, ${project.accentTo})`,
      }}
    >
      <div
        className="absolute -left-1/4 -top-1/3 h-2/3 w-2/3 rounded-full opacity-50 blur-2xl"
        style={{ background: project.accentFrom }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 h-2/3 w-2/3 rounded-full opacity-40 blur-2xl"
        style={{ background: project.accentTo }}
      />
    </div>
  )
}

export function ProjectMockup({ project }: { project: Project }) {
  if (project.mockupType === 'mobile') {
    return (
      <div className="flex h-full items-center justify-center bg-bg-elevated py-6">
        <div className="relative h-full w-[46%] overflow-hidden rounded-[1.4rem] border-[3px] border-white/10 bg-black shadow-2xl">
          <MockupSurface project={project} />
          <div className="absolute left-1/2 top-2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-black/60" />
        </div>
      </div>
    )
  }

  if (project.mockupType === 'dashboard') {
    return (
      <div className="flex h-full items-center justify-center bg-bg-elevated p-6">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md border border-white/10 bg-black shadow-2xl">
          <MockupSurface project={project} />
          <div className="absolute inset-x-4 top-4 flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/40" />
            <span className="h-2 w-2 rounded-full bg-white/25" />
            <span className="h-2 w-2 rounded-full bg-white/25" />
          </div>
          <div className="absolute inset-x-4 bottom-4 flex items-end gap-1.5">
            {[40, 65, 30, 80, 50, 70, 45].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-white/25"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // web
  return (
    <div className="flex h-full items-center justify-center bg-bg-elevated p-6">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md border border-white/10 bg-black shadow-2xl">
        <div className="absolute inset-x-0 top-0 flex h-6 items-center gap-1.5 border-b border-white/10 bg-black/40 px-3">
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        </div>
        <div className="absolute inset-x-0 bottom-0 top-6">
          <MockupSurface project={project} />
        </div>
      </div>
    </div>
  )
}
