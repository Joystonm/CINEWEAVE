import { memo } from 'react'
import { Clapperboard, Play, Download } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'
import { CWNodeBase } from './CWNodeBase'
import { AudioPlayer } from '../ui/AudioPlayer'
import { useWorkflowStore } from '../../store/workflowStore'
import type { FinalOutputNodeData } from '../../types'

export const FinalOutputNode = memo(function FinalOutputNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as FinalOutputNodeData
  const setShowLineagePanel = useWorkflowStore((s) => s.setShowLineagePanel)

  const hasAny = nodeData.videoUrl || nodeData.audioUrl || nodeData.musicUrl

  return (
    <CWNodeBase
      title="Cinematic Output"
      subtitle="Final Project"
      icon={<Clapperboard size={13} style={{ color: '#10b981' }} />}
      accentColor="#10b981"
      glowColor="rgba(16,185,129,0.4)"
      status={nodeData.status}
      selected={selected}
      hasOutput={false}
    >
      {nodeData.status === 'complete' && hasAny && (
        <div className="space-y-2">
          {/* Title */}
          {nodeData.title && (
            <div
              className="text-[11px] font-semibold text-white/90 px-2 py-1.5 rounded-lg text-center"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              🎬 {nodeData.title}
            </div>
          )}

          {/* Video preview thumbnail */}
          {nodeData.videoUrl && (
            <div
              className="w-full rounded-lg overflow-hidden relative group"
              style={{ aspectRatio: '16/9', background: '#0f0f1a' }}
            >
              <video
                src={nodeData.videoUrl}
                className="w-full h-full object-cover"
                controls
                muted
                playsInline
              />
              {/* Download overlay button */}
              <a
                href={nodeData.videoUrl}
                download={`${nodeData.title || 'video'}.mp4`}
                target="_blank"
                rel="noopener noreferrer"
                title="Download video"
                className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
              >
                <Download size={12} />
              </a>
            </div>
          )}

          {/* Audio tracks */}
          {nodeData.audioUrl && (
            <AudioPlayer url={nodeData.audioUrl} label="Narration" />
          )}
          {nodeData.musicUrl && (
            <AudioPlayer url={nodeData.musicUrl} label="Score" />
          )}

          {/* Download all button */}
          {(nodeData.audioUrl || nodeData.musicUrl) && (
            <div className="flex gap-2">
              {nodeData.videoUrl && (
                <a
                  href={nodeData.videoUrl}
                  download={`${nodeData.title || 'video'}.mp4`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
                >
                  <Download size={10} /> Video
                </a>
              )}
              {nodeData.audioUrl && (
                <a
                  href={nodeData.audioUrl}
                  download={`${nodeData.title || 'narration'}.mp3`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
                  style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', color: '#22d3ee' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(6,182,212,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(6,182,212,0.1)')}
                >
                  <Download size={10} /> Voice
                </a>
              )}
              {nodeData.musicUrl && (
                <a
                  href={nodeData.musicUrl}
                  download={`${nodeData.title || 'score'}.mp3`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
                  style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)', color: '#fbbf24' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(217,119,6,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(217,119,6,0.1)')}
                >
                  <Download size={10} /> Score
                </a>
              )}
            </div>
          )}

          {/* Lineage link */}
          <button
            onClick={() => setShowLineagePanel(true, id)}
            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Play size={9} />
            View production lineage
          </button>
        </div>
      )}

      {nodeData.status === 'idle' && (
        <div className="text-[10px] text-white/25 italic">
          Final cinematic project will appear here...
        </div>
      )}
    </CWNodeBase>
  )
})
