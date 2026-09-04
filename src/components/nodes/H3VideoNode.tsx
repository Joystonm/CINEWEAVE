import { memo } from 'react'
import { Film, Play, Download } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'
import { CWNodeBase } from './CWNodeBase'
import type { H3VideoNodeData } from '../../types'

const STATUS_LABELS: Record<string, string> = {
  idle: 'Awaiting prompt',
  ready: 'Ready to generate',
  queued: 'Queued...',
  processing: 'Generating footage...',
  running: 'Directing...',
  complete: 'Footage ready',
  error: 'Generation failed',
}

export const H3VideoNode = memo(function H3VideoNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as H3VideoNodeData

  return (
    <CWNodeBase
      title="MiniMax H3"
      subtitle="Cinematic Video"
      icon={<Film size={13} style={{ color: '#db2777' }} />}
      accentColor="#db2777"
      glowColor="rgba(219,39,119,0.5)"
      status={nodeData.status}
      processingMessage={nodeData.processingMessage}
      selected={selected}
    >
      {nodeData.status === 'complete' && nodeData.videoUrl && (
        <div className="space-y-1.5">
          {/* Thumbnail or video preview */}
          <div
            className="w-full rounded-lg overflow-hidden relative group"
            style={{ aspectRatio: '16/9', background: '#0f0f1a' }}
          >
            <video
              src={nodeData.videoUrl}
              className="w-full h-full object-cover"
              controls={false}
              muted
              loop
              autoPlay
              playsInline
            />
            {/* Hover overlay with play + download */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={20} className="text-white" />
              <a
                href={nodeData.videoUrl}
                download={`h3-video.mp4`}
                target="_blank"
                rel="noopener noreferrer"
                title="Download video"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
              >
                <Download size={13} />
              </a>
            </div>
          </div>
          <p className="text-[9px] text-white/30 text-center">
            {nodeData.resolution} · {nodeData.duration}s · {nodeData.ratio}
          </p>
        </div>
      )}

      {(nodeData.status === 'processing' || nodeData.status === 'queued') && (
        <div className="space-y-1.5">
          <div
            className="w-full rounded-lg h-[60px] loading-shimmer"
            style={{ background: 'rgba(219,39,119,0.08)', border: '1px solid rgba(219,39,119,0.15)' }}
          />
          <p className="text-[10px] text-white/50 text-center">
            {STATUS_LABELS[nodeData.status] || 'Processing...'}
          </p>
        </div>
      )}

      {nodeData.status === 'error' && nodeData.error && (
        <div className="text-[10px] text-red-400 rounded-lg px-2 py-1.5"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          {nodeData.error.slice(0, 80)}
        </div>
      )}

      {(nodeData.status === 'idle' || nodeData.status === 'ready') && (
        <div className="space-y-1">
          {nodeData.prompt ? (
            <div className="text-[10px] text-white/40 leading-relaxed">
              {nodeData.prompt.slice(0, 70)}...
            </div>
          ) : (
            <div className="text-[10px] text-white/25 italic">
              {STATUS_LABELS[nodeData.status]}
            </div>
          )}
          <p className="text-[9px] text-white/20">
            {nodeData.resolution} · {nodeData.duration}s · {nodeData.ratio}
          </p>
        </div>
      )}
    </CWNodeBase>
  )
})
