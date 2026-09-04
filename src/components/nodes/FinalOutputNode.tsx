import { memo, useState, useCallback, useEffect } from 'react'
import { Clapperboard, Play, Download, RefreshCw } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'
import { CWNodeBase } from './CWNodeBase'
import { AudioPlayer } from '../ui/AudioPlayer'
import { useWorkflowStore } from '../../store/workflowStore'
import type { FinalOutputNodeData } from '../../types'

export const FinalOutputNode = memo(function FinalOutputNode({ id, data, selected }: NodeProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const setShowLineagePanel = useWorkflowStore((s) => s.setShowLineagePanel)

  // Subscribe directly to this node's data in the store
  const storeNodeData = useWorkflowStore((s) => {
    const node = s.nodes.find((n) => n.id === id)
    return node?.data as FinalOutputNodeData | undefined
  })

  // Use store data if available, otherwise fall back to React Flow prop data
  const nodeData = storeNodeData ?? (data as unknown as FinalOutputNodeData)

  const hasAny = nodeData.videoUrl || nodeData.audioUrl || nodeData.musicUrl

  // Auto-refresh when store data changes (e.g., after workflow execution)
  useEffect(() => {
    // This effect runs when nodeData changes, which happens when store updates
    // No action needed here - just the re-render triggered by store subscription
  }, [nodeData.videoUrl, nodeData.audioUrl, nodeData.musicUrl, nodeData.title])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)

    setTimeout(() => {
      const { nodes, edges, updateNodeData } = useWorkflowStore.getState()

      const thisNode = nodes.find((n) => n.id === id)
      const currentTitle = (thisNode?.data as FinalOutputNodeData)?.title || 'Cinematic Project'

      const upstreamIds = edges
        .filter((e) => e.target === id)
        .map((e) => e.source)

      const upstream = nodes.filter((n) => upstreamIds.includes(n.id))

      let videoUrl: string | null = null
      let audioUrl: string | null = null
      let musicUrl: string | null = null
      let title = currentTitle

      for (const upNode of upstream) {
        const upData = upNode.data as Record<string, unknown>
        if (upNode.type === 'h3Video' && upData.videoUrl) {
          videoUrl = upData.videoUrl as string
        }
        if (upNode.type === 'speech28' && upData.audioUrl) {
          audioUrl = upData.audioUrl as string
        }
        if (upNode.type === 'music30' && upData.audioUrl) {
          musicUrl = upData.audioUrl as string
        }
        if (upNode.type === 'm3Director' && upData.blueprint) {
          const bp = upData.blueprint as { title?: string }
          title = bp.title || title
        }
      }

      // Fallback: look for speech28 anywhere in the workflow if not found upstream
      if (!audioUrl) {
        const speechNode = nodes.find((n) => n.type === 'speech28' && (n.data as Record<string, unknown>).audioUrl)
        if (speechNode) {
          audioUrl = (speechNode.data as Record<string, unknown>).audioUrl as string
        }
      }

      updateNodeData(id, { videoUrl, audioUrl, musicUrl, title })
      setIsRefreshing(false)
    }, 50)
  }, [id])

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
      {/* Content area — scrollable with max-height */}
      <div style={{ padding: '0 14px 14px', maxHeight: 320, overflowY: 'auto' }}>
        {hasAny && (
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

            {/* Video preview */}
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

            {/* Download buttons */}
            <div className="flex gap-2 flex-wrap">
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
          </div>
        )}

        {/* Refresh button — always visible when there's an upstream connection */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-medium transition-colors mt-2"
          style={{
            background: hasAny ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: hasAny ? '#34d399' : 'rgba(255,255,255,0.35)',
          }}
          onMouseEnter={(e) => {
            if (hasAny) e.currentTarget.style.background = 'rgba(16,185,129,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = hasAny ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)'
          }}
        >
          <RefreshCw size={10} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : hasAny ? 'Refresh from upstream' : 'No upstream connected'}
        </button>

        {/* Lineage link */}
        <button
          onClick={() => setShowLineagePanel(true, id)}
          className="flex items-center gap-1 text-[10px] mt-1 transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
          <Play size={9} />
          View production lineage
        </button>

        {!hasAny && nodeData.status === 'idle' && (
          <div className="text-[10px] text-white/25 italic mt-2">
            Run the workflow to generate assets...
          </div>
        )}
      </div>
    </CWNodeBase>
  )
})
