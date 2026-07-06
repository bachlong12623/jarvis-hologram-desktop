import type { ModuleStatus } from '../../types/systemMetrics'

type ModuleGridProps = {
  modules: ModuleStatus[]
}

const STATUS_CLASS: Record<ModuleStatus['status'], string> = {
  OK: 'status-ok',
  ACTIVE: 'status-active',
  SYNC: 'status-sync',
  WARN: 'status-warn',
}

export function ModuleGrid({ modules }: ModuleGridProps) {
  return (
    <div className="hud-panel hud-modules">
      <div className="hud-panel-header">
        <span className="hud-panel-title">SUBSYSTEMS</span>
        <span className="hud-panel-sub">{modules.length} ACTIVE</span>
      </div>
      <div className="hud-module-grid">
        {modules.map((mod) => (
          <div key={mod.name} className="hud-module-row">
            <span className="hud-module-name">{mod.name}</span>
            <div className="hud-module-bar">
              <div
                className="hud-module-fill"
                style={{ width: `${mod.load}%` }}
              />
            </div>
            <span className={`hud-module-status ${STATUS_CLASS[mod.status]}`}>
              {mod.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
