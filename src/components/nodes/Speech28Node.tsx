import { memo } from 'react'
import { Mic2 } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'
import { CWNodeBase } from './CWNodeBase'
import { AudioPlayer } from '../ui/AudioPlayer'
import type { Speech28NodeData } from '../../types'

export const Speech28Node = memo(function Speech28Node({ data, selected }: NodeProps) {
  const nodeData = data as unknown as Speech28NodeData

  return (
    <CWNodeBase
      title="Speech 2.8"
      subtitle="Cinematic Narration"
      icon={<Mic2 size={13} style={{ color: '#0891b2' }} />}
      accentColor="#0891b2"
      glowColor="rgba(8,145,178,0.4)"
      status={nodeData.status}
      processingMessage={nodeData.processingMessage}
      selected={selected}
    >
      {nodeData.status === 'complete' && nodeData.audioUrl && (
        <div className="space-y-1.5">
          <AudioPlayer url={nodeData.audioUrl} label="Narration" />
          <div className="flex items-center gap-1.5">
            {nodeData.emotion !== 'auto' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-700/30">
                {nodeData.emotion}
              </span>
            )}
            <span className="text-[9px] text-white/25">
              {nodeData.voiceId?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      )}

      {(nodeData.status === 'processing' || nodeData.status === 'queued') && (
        <div
          className="w-full rounded-lg h-[36px] loading-shimmer"
          style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.15)' }}
        />
      )}

      {nodeData.status === 'error' && nodeData.error && (
        <div className="text-[10px] text-red-400">{nodeData.error.slice(0, 80)}</div>
      )}

      {(nodeData.status === 'idle' || nodeData.status === 'ready') && (
        <div className="space-y-1">
          {nodeData.text ? (
            <div className="text-[10px] text-white/40 leading-relaxed italic">
              "{nodeData.text.slice(0, 60)}..."
            </div>
          ) : (
            <div className="text-[10px] text-white/25 italic">
              Awaiting narration text...
            </div>
          )}
        </div>
      )}
    </CWNodeBase>
  )
})
