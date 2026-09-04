import { memo } from 'react'
import { Zap, AlertCircle, CheckCircle } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'
import { CWNodeBase } from './CWNodeBase'
import type { M27AssistantNodeData } from '../../types'

export const M27AssistantNode = memo(function M27AssistantNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as M27AssistantNodeData
  const result = nodeData.result

  return (
    <CWNodeBase
      title="MiniMax M2.7"
      subtitle="Workflow Assistant"
      icon={<Zap size={13} style={{ color: '#6366f1' }} />}
      accentColor="#6366f1"
      glowColor="rgba(99,102,241,0.4)"
      status={nodeData.status}
      selected={selected}
    >
      {nodeData.status === 'complete' && result && (
        <div className="space-y-1.5">
          {result.issues && result.issues.length > 0 && (
            <div>
              {result.issues.slice(0, 2).map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px]" style={{ color: '#fbbf24' }}>
                  <AlertCircle size={9} className="flex-shrink-0 mt-0.5" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          )}
          {result.suggestions && result.suggestions.length > 0 && (
            <div>
              {result.suggestions.slice(0, 2).map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px]" style={{ color: '#34d399' }}>
                  <CheckCircle size={9} className="flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
          {result.result && (
            <p className="text-[10px] text-white/50 leading-relaxed">
              {result.result.length > 80 ? result.result.slice(0, 77) + '...' : result.result}
            </p>
          )}
        </div>
      )}

      {nodeData.status === 'error' && nodeData.error && (
        <div className="text-[10px] text-red-400">{nodeData.error}</div>
      )}

      {nodeData.status === 'idle' && (
        <div className="text-[10px] text-white/25 italic">
          Validates and optimizes workflow...
        </div>
      )}
    </CWNodeBase>
  )
})
