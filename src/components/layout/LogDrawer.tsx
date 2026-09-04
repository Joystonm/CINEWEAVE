import { useState } from 'react'
import { ChevronUp, ChevronDown, Terminal, Trash2 } from 'lucide-react'
import { ExecutionLog } from '../workflow/ExecutionLog'
import { useWorkflowStore } from '../../store/workflowStore'

export function LogDrawer() {
  const [expanded, setExpanded] = useState(false)
  const { executionLog, clearLog } = useWorkflowStore()
  const logCount = executionLog.length
  const hasErrors = executionLog.some((e) => e.level === 'error')

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
      {/* Header — div, not button, to avoid nested button issue */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', cursor: 'pointer',
          background: '#1a1a2e',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1a2e')}
      >
        <Terminal size={11} style={{ color: hasErrors ? '#f87171' : 'rgba(255,255,255,0.3)' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Execution Log
        </span>
        {logCount > 0 && (
          <span style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 99, fontWeight: 500,
            background: hasErrors ? 'rgba(248,113,113,0.15)' : 'rgba(139,92,246,0.15)',
            color: hasErrors ? '#f87171' : '#a78bfa',
          }}>
            {logCount}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {logCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); clearLog() }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
            >
              <Trash2 size={10} />
            </button>
          )}
          {expanded
            ? <ChevronDown size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
            : <ChevronUp size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
          }
        </div>
      </div>

      {/* Log content */}
      {expanded && (
        <div style={{ height: 160, overflowY: 'auto', background: '#13131f' }}>
          <ExecutionLog />
        </div>
      )}
    </div>
  )
}
