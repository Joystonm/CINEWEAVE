import { useState } from 'react'
import { Play, Trash2, GitBranch, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useWorkflowStore } from '../../store/workflowStore'
import { executeWorkflow } from '../../services/executor'

const STATUS_CONFIG = {
  idle:       { label: 'Ready',        color: 'var(--cw-text-muted)'  },
  validating: { label: 'Validating...', color: '#7c3aed' },
  running:    { label: 'Executing...',  color: '#d97706' },
  complete:   { label: 'Complete',      color: 'var(--cw-success)' },
  error:      { label: 'Failed',        color: 'var(--cw-error)' },
}

function StatusIcon({ status }: { status: string }) {
  const spin = { animation: 'spin 1s linear infinite' }
  if (status === 'validating') return <Loader2 size={12} style={{ color: '#7c3aed', ...spin }} />
  if (status === 'running')    return <Loader2 size={12} style={{ color: '#d97706', ...spin }} />
  if (status === 'complete')   return <CheckCircle size={12} style={{ color: 'var(--cw-success)' }} />
  if (status === 'error')      return <AlertCircle size={12} style={{ color: 'var(--cw-error)' }} />
  return null
}

export function Toolbar() {
  const workflowName    = useWorkflowStore((s) => s.workflowName)
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName)
  const workflowStatus  = useWorkflowStore((s) => s.workflowStatus)
  const nodes           = useWorkflowStore((s) => s.nodes)
  const edges           = useWorkflowStore((s) => s.edges)
  const clearWorkflow   = useWorkflowStore((s) => s.clearWorkflow)
  const executionLog    = useWorkflowStore((s) => s.executionLog)

  const [showErrorLog, setShowErrorLog] = useState(false)

  const isRunning = workflowStatus === 'running' || workflowStatus === 'validating'
  const canRun = nodes.length > 0 && !isRunning
  const cfg = STATUS_CONFIG[workflowStatus] || STATUS_CONFIG.idle

  // Get error messages from log
  const errorMessages = executionLog
    .filter((e) => e.level === 'error')
    .map((e) => e.message)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 16px', height: 48, flexShrink: 0,
      background: 'var(--cw-bg-elevated)', borderBottom: '1px solid var(--cw-border)',
      position: 'relative',
    }}>
      {/* Workflow name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
        <GitBranch size={12} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="Untitled Workflow"
          style={{
            background: 'none', border: 'none', outline: 'none',
            fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
            maxWidth: 200,
          }}
        />
      </div>

      {/* Status with error tooltip */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 500, color: cfg.color,
            cursor: workflowStatus === 'error' ? 'pointer' : 'default',
          }}
          onMouseEnter={() => workflowStatus === 'error' && setShowErrorLog(true)}
          onMouseLeave={() => setShowErrorLog(false)}
        >
          <StatusIcon status={workflowStatus} />
          <span>{cfg.label}</span>
          {workflowStatus === 'error' && (
            <span style={{ fontSize: 9, color: 'rgba(248,113,113,0.6)', marginLeft: 2 }}>
              (hover for details)
            </span>
          )}
        </div>

        {/* Error tooltip */}
        {showErrorLog && errorMessages.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 8,
            background: '#1a0a0a', border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8, padding: '10px 12px', zIndex: 100,
            minWidth: 280, maxWidth: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#f87171', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Workflow Errors
            </div>
            {errorMessages.map((msg, i) => (
              <div key={i} style={{
                fontSize: 11, color: 'rgba(248,113,113,0.85)', lineHeight: 1.5,
                paddingTop: i > 0 ? 4 : 0, borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                {msg}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Counts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
        <span>{nodes.length} nodes</span>
        <span>·</span>
        <span>{edges.length} edges</span>
      </div>

      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />

      {/* Clear */}
      <button
        onClick={clearWorkflow}
        title="Clear workflow"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', background: 'none', border: 'none',
          cursor: 'pointer', borderRadius: 6, color: 'rgba(255,255,255,0.35)', fontSize: 11,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
      >
        <Trash2 size={11} />
      </button>

      {/* Run */}
      <button
        onClick={() => { if (canRun) executeWorkflow() }}
        disabled={!canRun}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 8, border: 'none',
          fontSize: 12, fontWeight: 600, color: 'white',
          cursor: canRun ? 'pointer' : 'not-allowed',
          background: canRun
            ? 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(99,102,241,0.9))'
            : 'rgba(255,255,255,0.06)',
          opacity: canRun ? 1 : 0.5,
        }}
      >
        <Play size={11} style={{ fill: 'white' }} />
        {isRunning ? 'Running...' : 'Run Workflow'}
      </button>
    </div>
  )
}
