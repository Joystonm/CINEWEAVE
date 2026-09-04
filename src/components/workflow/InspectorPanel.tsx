import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Lightbulb, Sparkles, Zap, Film, Mic2, Music, Clapperboard, ChevronDown, Download
} from 'lucide-react'
import { useWorkflowStore } from '../../store/workflowStore'
import { AudioPlayer } from '../ui/AudioPlayer'
import type {
  IdeaNodeData, M3DirectorNodeData, M27AssistantNodeData,
  H3VideoNodeData, Speech28NodeData, Music30NodeData, FinalOutputNodeData
} from '../../types'
import { EMOTION_OPTIONS, VOICE_IDS } from '../../types'

const NODE_ICONS = {
  idea: <Lightbulb size={14} style={{ color: '#818cf8' }} />,
  m3Director: <Sparkles size={14} style={{ color: '#a78bfa' }} />,
  m27Assistant: <Zap size={14} style={{ color: '#818cf8' }} />,
  h3Video: <Film size={14} style={{ color: '#f472b6' }} />,
  speech28: <Mic2 size={14} style={{ color: '#22d3ee' }} />,
  music30: <Music size={14} style={{ color: '#fbbf24' }} />,
  finalOutput: <Clapperboard size={14} style={{ color: '#34d399' }} />,
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium text-white/50 mb-1">{children}</label>
}

function Input({ value, onChange, placeholder, multiline = false, rows = 3 }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
}) {
  const cls = `
    w-full text-[11px] text-white/80 rounded-lg px-3 py-2
    bg-white/4 border border-white/8 resize-none
    focus:outline-none focus:border-violet-500/50 focus:bg-white/6
    placeholder:text-white/20 transition-colors
  `
  if (multiline) {
    return (
      <textarea
        className={cls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    )
  }
  return (
    <input
      className={cls}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

function Select({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        className="w-full text-[11px] text-white/80 rounded-lg px-3 py-2 bg-white/4 border border-white/8 appearance-none focus:outline-none focus:border-violet-500/50 transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#1e1e36]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  )
}

// ─── Node inspectors ──────────────────────────────────────────────────────────

function IdeaInspector({ id }: { id: string }) {
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === id))
  const update = useWorkflowStore((s) => s.updateNodeData)
  if (!node) return null
  const data = node.data as IdeaNodeData

  return (
    <div className="space-y-3">
      <div>
        <Label>Creative Idea *</Label>
        <Input
          multiline
          rows={5}
          value={data.idea}
          onChange={(v) => update(id, { idea: v })}
          placeholder="A detective searches for a missing witness in rain-soaked Mumbai..."
        />
      </div>
      <div>
        <Label>Genre</Label>
        <Input
          value={data.genre}
          onChange={(v) => update(id, { genre: v })}
          placeholder="Crime Thriller, Sci-Fi, Drama..."
        />
      </div>
      <div>
        <Label>Mood / Tone</Label>
        <Input
          value={data.mood}
          onChange={(v) => update(id, { mood: v })}
          placeholder="Dark, tense, melancholic..."
        />
      </div>
    </div>
  )
}

function M3Inspector({ id }: { id: string }) {
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === id))
  if (!node) return null
  const data = node.data as M3DirectorNodeData
  const bp = data.blueprint

  if (!bp) {
    return (
      <div className="text-[11px] text-white/30 italic text-center py-8">
        Connect an Idea node and run the workflow to see M3's cinematic direction.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Title + logline */}
      <div className="rounded-lg p-3" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="text-sm font-semibold text-white/90 mb-1">{bp.title}</div>
        {bp.logline && <div className="text-[11px] text-white/50 italic">{bp.logline}</div>}
      </div>

      {/* Creative direction */}
      {bp.creative_direction && (
        <div>
          <Label>Creative Direction</Label>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-white/40">Genre</span>
              <span className="text-white/70">{bp.creative_direction.genre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Tone</span>
              <span className="text-white/70">{bp.creative_direction.tone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Visual Language</span>
              <span className="text-white/70 text-right max-w-[60%]">{bp.creative_direction.visual_language}</span>
            </div>
            {bp.creative_direction.cinematography_style && (
              <div className="flex justify-between">
                <span className="text-white/40">Camera Style</span>
                <span className="text-white/70 text-right max-w-[60%]">{bp.creative_direction.cinematography_style}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emotional Arc */}
      {bp.emotional_arc && (
        <div>
          <Label>Emotional Arc</Label>
          <div className="space-y-1.5 text-[11px]">
            {Object.entries(bp.emotional_arc).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-white/40 capitalize flex-shrink-0 w-16">{k}</span>
                <span className="text-white/65">{v as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenes */}
      {bp.scenes?.length > 0 && (
        <div>
          <Label>Scenes ({bp.scenes.length})</Label>
          <div className="space-y-2">
            {bp.scenes.map((scene) => (
              <div key={scene.scene} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[11px] font-medium text-white/80 mb-1">
                  Scene {scene.scene}: {scene.title || scene.purpose}
                </div>
                <div className="grid grid-cols-2 gap-x-3 text-[10px] mb-1.5">
                  <div><span className="text-white/30">Camera: </span><span className="text-white/60">{scene.camera}</span></div>
                  <div><span className="text-white/30">Emotion: </span><span className="text-white/60">{scene.emotion}</span></div>
                </div>
                {scene.video_prompt && (
                  <div className="text-[10px] text-white/40 italic leading-relaxed">
                    "{scene.video_prompt.slice(0, 100)}..."
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* H3 prompt */}
      {bp.h3_primary_prompt && (
        <div>
          <Label>H3 Video Prompt</Label>
          <div className="text-[11px] text-white/50 rounded-lg p-2.5 leading-relaxed"
            style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)' }}>
            {bp.h3_primary_prompt}
          </div>
        </div>
      )}

      {/* Music brief */}
      {bp.music_brief && (
        <div>
          <Label>Music Brief</Label>
          <div className="text-[11px] text-white/50 rounded-lg p-2.5 space-y-1"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div><span className="text-amber-300/70">Opening: </span>{bp.music_brief.opening}</div>
            <div><span className="text-amber-300/70">Middle: </span>{bp.music_brief.middle}</div>
            <div><span className="text-amber-300/70">Climax: </span>{bp.music_brief.climax}</div>
            <div><span className="text-amber-300/70">Ending: </span>{bp.music_brief.ending}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function M27Inspector({ id }: { id: string }) {
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === id))
  const update = useWorkflowStore((s) => s.updateNodeData)
  if (!node) return null
  const data = node.data as M27AssistantNodeData
  const result = data.result

  return (
    <div className="space-y-3">
      <div>
        <Label>Task</Label>
        <Input
          multiline
          rows={3}
          value={data.task}
          onChange={(v) => update(id, { task: v })}
          placeholder="Validate workflow, optimize prompts, suggest improvements..."
        />
      </div>

      {result && (
        <div className="space-y-2">
          {result.result && (
            <div>
              <Label>Analysis</Label>
              <div className="text-[11px] text-white/60 rounded-lg p-2.5 leading-relaxed"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                {result.result}
              </div>
            </div>
          )}
          {result.issues?.length > 0 && (
            <div>
              <Label>Issues</Label>
              <ul className="space-y-1">
                {result.issues.map((issue, i) => (
                  <li key={i} className="text-[11px] text-amber-300 flex items-start gap-1.5">
                    <span>⚠</span><span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestions?.length > 0 && (
            <div>
              <Label>Suggestions</Label>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-[11px] text-emerald-300 flex items-start gap-1.5">
                    <span>✓</span><span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.optimized_prompt && (
            <div>
              <Label>Optimized Prompt</Label>
              <div className="text-[11px] text-white/60 rounded-lg p-2.5 leading-relaxed italic"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                {result.optimized_prompt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function H3Inspector({ id }: { id: string }) {
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === id))
  const update = useWorkflowStore((s) => s.updateNodeData)
  if (!node) return null
  const data = node.data as H3VideoNodeData

  return (
    <div className="space-y-3">
      {data.videoUrl && (
        <div className="rounded-lg overflow-hidden relative group" style={{ aspectRatio: '16/9', background: '#0f0f1a' }}>
          <video src={data.videoUrl} className="w-full h-full object-cover" controls playsInline />
          <a
            href={data.videoUrl}
            download={`h3-video-${id}.mp4`}
            target="_blank"
            rel="noopener noreferrer"
            title="Download video"
            className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            <Download size={14} />
          </a>
        </div>
      )}

      <div>
        <Label>Prompt</Label>
        <Input
          multiline
          rows={5}
          value={data.prompt}
          onChange={(v) => update(id, { prompt: v })}
          placeholder="Cinematic prompt will be auto-filled from M3 Creative Director, or enter manually..."
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Resolution</Label>
          <Select
            value={data.resolution}
            onChange={(v) => update(id, { resolution: v })}
            options={[{ value: '2K', label: '2K' }, { value: '1080p', label: '1080p' }]}
          />
        </div>
        <div>
          <Label>Duration (s)</Label>
          <Select
            value={String(data.duration)}
            onChange={(v) => update(id, { duration: Number(v) })}
            options={[5, 10, 15].map((n) => ({ value: String(n), label: `${n}s` }))}
          />
        </div>
        <div>
          <Label>Ratio</Label>
          <Select
            value={data.ratio}
            onChange={(v) => update(id, { ratio: v })}
            options={['16:9', '9:16', '1:1', '4:3'].map((r) => ({ value: r, label: r }))}
          />
        </div>
      </div>

      {data.requestId && (
        <div className="text-[10px] text-white/25">Request ID: {data.requestId}</div>
      )}
    </div>
  )
}

function SpeechInspector({ id }: { id: string }) {
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === id))
  const update = useWorkflowStore((s) => s.updateNodeData)
  if (!node) return null
  const data = node.data as Speech28NodeData

  return (
    <div className="space-y-3">
      {data.audioUrl && <AudioPlayer url={data.audioUrl} label="Generated Narration" />}

      <div>
        <Label>Narration Text *</Label>
        <Input
          multiline
          rows={4}
          value={data.text}
          onChange={(v) => update(id, { text: v })}
          placeholder="Some calls change your night. This one changed everything. Auto-filled from M3 blueprint..."
        />
      </div>

      <div>
        <Label>Voice</Label>
        <Select
          value={data.voiceId}
          onChange={(v) => update(id, { voiceId: v })}
          options={VOICE_IDS.map((v) => ({ value: v.id, label: v.label }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Emotion</Label>
          <Select
            value={data.emotion}
            onChange={(v) => update(id, { emotion: v })}
            options={EMOTION_OPTIONS.map((e) => ({ value: e, label: e.charAt(0).toUpperCase() + e.slice(1) }))}
          />
        </div>
        <div>
          <Label>Speed</Label>
          <Select
            value={String(data.speed)}
            onChange={(v) => update(id, { speed: Number(v) })}
            options={[0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3].map((s) => ({ value: String(s), label: `${s}×` }))}
          />
        </div>
      </div>
    </div>
  )
}

function MusicInspector({ id }: { id: string }) {
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === id))
  const update = useWorkflowStore((s) => s.updateNodeData)
  if (!node) return null
  const data = node.data as Music30NodeData

  return (
    <div className="space-y-3">
      {data.audioUrl && <AudioPlayer url={data.audioUrl} label="Generated Score" />}

      <div>
        <Label>Lyrics / Structure</Label>
        <Input
          multiline
          rows={6}
          value={data.lyrics}
          onChange={(v) => update(id, { lyrics: v })}
          placeholder={`[Intro]\n(Soft atmospheric tension)\n\n[Verse]\nRain falls on empty streets...\n\n[Chorus]\n...`}
        />
        <p className="text-[9px] text-white/20 mt-1">
          Supports tags: [Intro] [Verse] [Chorus] [Bridge] [Outro] [Inst]
        </p>
      </div>

      <div>
        <Label>Style Prompt</Label>
        <Input
          multiline
          rows={2}
          value={data.prompt}
          onChange={(v) => update(id, { prompt: v })}
          placeholder="Dark cinematic orchestral, slow atmospheric build, sudden silence at end..."
        />
      </div>
    </div>
  )
}

function FinalOutputInspector({ id }: { id: string }) {
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === id))
  if (!node) return null
  const data = node.data as FinalOutputNodeData

  if (!data.videoUrl && !data.audioUrl && !data.musicUrl) {
    return (
      <div className="text-[11px] text-white/30 italic text-center py-8">
        Run the workflow to see your cinematic project here.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.title && (
        <div className="text-sm font-semibold text-white/90 text-center">🎬 {data.title}</div>
      )}
      {data.videoUrl && (
        <div className="rounded-lg overflow-hidden relative group" style={{ aspectRatio: '16/9', background: '#0f0f1a' }}>
          <video src={data.videoUrl} className="w-full h-full object-cover" controls playsInline />
          <a
            href={data.videoUrl}
            download={`${data.title || 'video'}.mp4`}
            target="_blank"
            rel="noopener noreferrer"
            title="Download video"
            className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            <Download size={14} />
          </a>
        </div>
      )}
      {data.audioUrl && <AudioPlayer url={data.audioUrl} label="Narration" />}
      {data.musicUrl && <AudioPlayer url={data.musicUrl} label="Cinematic Score" />}
    </div>
  )
}

// ─── Main Inspector Panel ─────────────────────────────────────────────────────
export function InspectorPanel() {
  const { selectedNodeId, nodes, setSelectedNode, removeNode } = useWorkflowStore()

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  const renderInspector = () => {
    if (!selectedNode) return null
    switch (selectedNode.type) {
      case 'idea': return <IdeaInspector id={selectedNode.id} />
      case 'm3Director': return <M3Inspector id={selectedNode.id} />
      case 'm27Assistant': return <M27Inspector id={selectedNode.id} />
      case 'h3Video': return <H3Inspector id={selectedNode.id} />
      case 'speech28': return <SpeechInspector id={selectedNode.id} />
      case 'music30': return <MusicInspector id={selectedNode.id} />
      case 'finalOutput': return <FinalOutputInspector id={selectedNode.id} />
      default: return <div className="text-[11px] text-white/30">No inspector available.</div>
    }
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        width: 280,
        background: 'var(--cw-bg-panel)',
        borderLeft: '1px solid var(--cw-border)',
      }}
    >
      <AnimatePresence mode="wait">
        {selectedNode ? (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
              {NODE_ICONS[selectedNode.type as keyof typeof NODE_ICONS]}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-white/80 truncate">
                  {(selectedNode.data as { label?: string }).label || selectedNode.type}
                </div>
                <div className="text-[10px] text-white/30">{selectedNode.type}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    removeNode(selectedNode.id)
                    setSelectedNode(null)
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-900/40 hover:text-red-400 text-white/30 transition-colors"
                  title="Delete node"
                >
                  <X size={11} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderInspector()}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <div className="text-3xl mb-3 opacity-20">⚙</div>
            <p className="text-[12px] text-white/30">Select a node to configure it</p>
            <p className="text-[10px] text-white/15 mt-1">Click any node on the canvas</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
