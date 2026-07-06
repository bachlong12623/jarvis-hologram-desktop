import type { ProcessEntry } from '../../types/systemMetrics'

type ProcessTableProps = {
  processes: ProcessEntry[]
}

export function ProcessTable({ processes }: ProcessTableProps) {
  return (
    <div className="hud-panel hud-processes">
      <div className="hud-panel-header">
        <span className="hud-panel-title">PROCESS TABLE</span>
        <span className="hud-panel-sub">{processes.length} THREADS</span>
      </div>
      <div className="hud-process-head">
        <span>PID</span>
        <span>NAME</span>
        <span>CPU</span>
        <span>MEM</span>
        <span>ST</span>
      </div>
      <div className="hud-process-body">
        {processes.map((p) => (
          <div key={p.pid + p.name} className="hud-process-row">
            <span>{p.pid}</span>
            <span className="hud-process-name">{p.name}</span>
            <span>{p.cpu}%</span>
            <span>{p.mem}MB</span>
            <span className={p.state === 'RUN' ? 'st-run' : 'st-wait'}>
              {p.state}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
