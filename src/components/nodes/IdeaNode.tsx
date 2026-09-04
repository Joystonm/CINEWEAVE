import { memo } from 'react'
import { Lightbulb } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'
import { CWNodeBase } from './CWNodeBase'
import type { IdeaNodeData } from '../../types'

export const IdeaNode = memo(function IdeaNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as IdeaNodeData

  const previewText = nodeData.idea
    ? nodeData.idea.length > 60
      ? nodeData.idea.slice(0, 57) + '...'
      : nodeData.idea
    : ''

  return (
    <CWNodeBase
      title="Creative Idea"
      subtitle="Starting point"
      icon={<Lightbulb size={13} style={{ color: '#6366f1' }} />}
      accentColor="#6366f1"
      glowColor="rgba(99,102,241,0.4)"
      status={nodeData.status}
      hasInput={false}
      selected={selected}
    >
      {previewText && (
        <div
          className="text-[10px] leading-relaxed rounded-lg px-2.5 py-2 text-white/60"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          "{previewText}"
        </div>
      )}
      {!previewText && (
        <div className="text-[10px] text-white/25 italic">Click to add your idea →</div>
      )}
      {nodeData.genre && (
        <div className="mt-1.5 flex gap-1 flex-wrap">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-700/30">
            {nodeData.genre}
          </span>
          {nodeData.mood && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/30">
              {nodeData.mood}
            </span>
          )}
        </div>
      )}
    </CWNodeBase>
  )
})
