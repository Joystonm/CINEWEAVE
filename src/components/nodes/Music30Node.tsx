import { memo } from 'react'
import { Music } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'
import { CWNodeBase } from './CWNodeBase'
import { AudioPlayer } from '../ui/AudioPlayer'
import type { Music30NodeData } from '../../types'

export const Music30Node = memo(function Music30Node({ data, selected }: NodeProps) {
  const nodeData = data as unknown as Music30NodeData

  return (
    <CWNodeBase
      title="Music 3.0"
      subtitle="Cinematic Score"
      icon={<Music size={13} style={{ color: '#d97706' }} />}
      accentColor="#d97706"
      glowColor="rgba(217,119,6,0.4)"
      status={nodeData.status}
      processingMessage={nodeData.processingMessage}
      selected={selected}
    >
      {nodeData.status === 'complete' && nodeData.audioUrl && (
        <div className="space-y-1.5">
          <AudioPlayer url={nodeData.audioUrl} label="Cinematic Score" />
          {nodeData.prompt && (
            <p className="text-[10px] text-white/30 leading-relaxed">
              {nodeData.prompt.slice(0, 60)}...
            </p>
          )}
        </div>
      )}

      {(nodeData.status === 'processing' || nodeData.status === 'queued') && (
        <div
          className="w-full rounded-lg h-[36px] loading-shimmer"
          style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)' }}
        />
      )}

      {nodeData.status === 'error' && nodeData.error && (
        <div className="text-[10px] text-red-400">{nodeData.error.slice(0, 80)}</div>
      )}

      {(nodeData.status === 'idle' || nodeData.status === 'ready') && (
        <div className="space-y-1">
          {nodeData.prompt ? (
            <div className="text-[10px] text-white/40 leading-relaxed">
              {nodeData.prompt.slice(0, 70)}...
            </div>
          ) : (
            <div className="text-[10px] text-white/25 italic">
              Awaiting music brief...
            </div>
          )}
        </div>
      )}
    </CWNodeBase>
  )
})
