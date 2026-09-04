import { memo } from 'react'
import { Sparkles, ChevronRight } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'
import { CWNodeBase } from './CWNodeBase'
import { useWorkflowStore } from '../../store/workflowStore'
import type { M3DirectorNodeData } from '../../types'

export const M3DirectorNode = memo(function M3DirectorNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as M3DirectorNodeData
  const setShowLineagePanel = useWorkflowStore((s) => s.setShowLineagePanel)

  const bp = nodeData.blueprint

  return (
    <CWNodeBase
      title="MiniMax M3"
      subtitle="Creative Director"
      icon={<Sparkles size={13} style={{ color: '#8b5cf6' }} />}
      accentColor="#8b5cf6"
      glowColor="rgba(139,92,246,0.5)"
      status={nodeData.status}
      processingMessage={nodeData.processingMessage}
      selected={selected}
      multipleOutputs
    >
      {nodeData.status === 'complete' && bp && (
        <div className="space-y-1.5">
          {/* Title */}
          <div
            className="text-[11px] font-semibold text-white/90 px-2 py-1.5 rounded-lg"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            {bp.title}
          </div>

          {/* Logline */}
          {bp.logline && (
            <p className="text-[10px] text-white/50 leading-relaxed italic">
              {bp.logline.length > 80 ? bp.logline.slice(0, 77) + '...' : bp.logline}
            </p>
          )}

          {/* Genre / Tone pills */}
          <div className="flex gap-1 flex-wrap">
            {bp.creative_direction?.genre && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/30">
                {bp.creative_direction.genre}
              </span>
            )}
            {bp.creative_direction?.tone && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-900/40 text-violet-300 border border-violet-700/30">
                {bp.creative_direction.tone}
              </span>
            )}
          </div>

          {/* Scene count */}
          {bp.scenes?.length > 0 && (
            <p className="text-[10px] text-white/40">
              {bp.scenes.length} scene{bp.scenes.length !== 1 ? 's' : ''} planned
            </p>
          )}

          {/* Lineage button */}
          <button
            onClick={() => setShowLineagePanel(true, id)}
            className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors mt-0.5"
          >
            <ChevronRight size={10} />
            View lineage
          </button>
        </div>
      )}

      {nodeData.status === 'error' && nodeData.error && (
        <div className="text-[10px] text-red-400 rounded-lg px-2 py-1.5"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          {nodeData.error}
        </div>
      )}

      {nodeData.status === 'idle' && (
        <div className="text-[10px] text-white/25 italic">
          Waiting for idea input...
        </div>
      )}
    </CWNodeBase>
  )
})
