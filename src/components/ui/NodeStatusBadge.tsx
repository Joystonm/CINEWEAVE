import type { NodeStatus } from '../../types'

interface NodeStatusBadgeProps {
  status: NodeStatus
  processingMessage?: string
}

const STATUS_CONFIG = {
  idle:       { label: 'Idle',       dot: '#555570', text: '#555570' },
  ready:      { label: 'Ready',      dot: '#34d399', text: '#34d399' },
  running:    { label: 'Running',    dot: '#a78bfa', text: '#a78bfa', pulse: true },
  queued:     { label: 'Queued',     dot: '#fbbf24', text: '#fbbf24' },
  processing: { label: 'Generating',  dot: '#fbbf24', text: '#fbbf24', pulse: true },
  complete:   { label: 'Complete',   dot: '#34d399', text: '#34d399' },
  error:      { label: 'Error',      dot: '#f87171', text: '#f87171' },
}

export function NodeStatusBadge({ status, processingMessage }: NodeStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle
  const label = processingMessage || config.label

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{
          flexShrink: 0,
          background: config.dot,
          ...(config.pulse ? { animation: 'pulse-glow 1.5s ease-in-out infinite' } : {}),
        }}
      />
      <span
        className="text-[10px] font-medium uppercase tracking-wider"
        style={{ color: config.text }}
      >
        {label}
      </span>
    </div>
  )
}
