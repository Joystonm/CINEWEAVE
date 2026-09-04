import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowDown, Sparkles, Zap, Film, Mic2, Music } from 'lucide-react'
import { useWorkflowStore } from '../../store/workflowStore'
import type { M3DirectorNodeData, H3VideoNodeData, Speech28NodeData, Music30NodeData } from '../../types'

interface LineageStep {
  icon: React.ReactNode
  model: string
  role: string
  detail: string
  color: string
  bgColor: string
}

function StepCard({ step, index }: { step: LineageStep; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <div
        className="rounded-xl p-4 relative"
        style={{ background: step.bgColor, border: `1px solid ${step.color}30` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}
          >
            {step.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white/80">{step.model}</div>
            <div className="text-[10px]" style={{ color: step.color }}>{step.role}</div>
            <div className="text-[10px] text-white/40 mt-1.5 leading-relaxed">{step.detail}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ConnectorArrow() {
  return (
    <div className="flex items-center justify-center h-6">
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px h-3 bg-white/15" />
        <ArrowDown size={10} className="text-white/20" />
      </div>
    </div>
  )
}

export function LineagePanel() {
  const { showLineagePanel, lineagePanelNodeId, setShowLineagePanel, nodes } = useWorkflowStore()

  if (!showLineagePanel) return null

  const node = lineagePanelNodeId ? nodes.find((n) => n.id === lineagePanelNodeId) : null

  // Build lineage steps based on what node is selected
  const buildLineage = (): LineageStep[] => {
    const steps: LineageStep[] = []

    // Always start with User Idea
    const ideaNode = nodes.find((n) => n.type === 'idea')
    if (ideaNode) {
      const d = ideaNode.data as { idea?: string; genre?: string }
      steps.push({
        icon: <span className="text-sm">💡</span>,
        model: 'Creator Input',
        role: 'Starting Idea',
        detail: d.idea ? `"${d.idea.slice(0, 80)}${d.idea.length > 80 ? '...' : ''}"` : 'Raw creative concept',
        color: '#6366f1',
        bgColor: 'rgba(99,102,241,0.06)',
      })
    }

    // M3 Creative Director
    const m3Node = nodes.find((n) => n.type === 'm3Director')
    if (m3Node && (m3Node.data as M3DirectorNodeData).status === 'complete') {
      const d = m3Node.data as M3DirectorNodeData
      steps.push({
        icon: <Sparkles size={14} className="text-violet-300" />,
        model: 'MiniMax M3',
        role: 'Creative Director — Cinematic Reasoning',
        detail: d.blueprint
          ? `Generated cinematic blueprint: "${d.blueprint.title}". Planned ${d.blueprint.scenes?.length || 0} scenes, emotional arc, visual language, and music brief.`
          : 'Transforms idea into structured cinematic direction',
        color: '#8b5cf6',
        bgColor: 'rgba(139,92,246,0.06)',
      })
    }

    // M2.7 if present
    const m27Node = nodes.find((n) => n.type === 'm27Assistant')
    if (m27Node && (m27Node.data as { status: string }).status === 'complete') {
      steps.push({
        icon: <Zap size={14} className="text-indigo-300" />,
        model: 'MiniMax M2.7',
        role: 'Workflow Assistant — Prompt Optimization',
        detail: 'Validated workflow connections, optimized prompts for downstream generation, suggested improvements.',
        color: '#6366f1',
        bgColor: 'rgba(99,102,241,0.06)',
      })
    }

    // Type-specific: H3 Video
    if (!node || node.type === 'h3Video' || node.type === 'finalOutput') {
      const h3 = nodes.find((n) => n.type === 'h3Video')
      if (h3 && (h3.data as H3VideoNodeData).status === 'complete') {
        const d = h3.data as H3VideoNodeData
        steps.push({
          icon: <Film size={14} className="text-pink-300" />,
          model: 'MiniMax H3',
          role: 'Video Generation — Cinematic Footage',
          detail: `Generated ${d.resolution} cinematic footage (${d.duration}s, ${d.ratio}) from M3-directed prompt. Submitted as async job and polled to completion.`,
          color: '#ec4899',
          bgColor: 'rgba(236,72,153,0.06)',
        })
      }
    }

    // Speech
    if (!node || node.type === 'speech28' || node.type === 'finalOutput') {
      const speech = nodes.find((n) => n.type === 'speech28')
      if (speech && (speech.data as Speech28NodeData).status === 'complete') {
        const d = speech.data as Speech28NodeData
        steps.push({
          icon: <Mic2 size={14} className="text-cyan-300" />,
          model: 'MiniMax Speech 2.8',
          role: 'Narration — Expressive Voice Generation',
          detail: `Generated cinematic narration using "${d.voiceId?.replace(/_/g, ' ')}" voice with ${d.emotion} emotional delivery. Text sourced from M3 blueprint.`,
          color: '#06b6d4',
          bgColor: 'rgba(6,182,212,0.06)',
        })
      }
    }

    // Music
    if (!node || node.type === 'music30' || node.type === 'finalOutput') {
      const music = nodes.find((n) => n.type === 'music30')
      if (music && (music.data as Music30NodeData).status === 'complete') {
        const d = music.data as Music30NodeData
        steps.push({
          icon: <Music size={14} className="text-amber-300" />,
          model: 'MiniMax Music 3.0',
          role: 'Score — Cinematic Soundtrack',
          detail: `Composed cinematic soundtrack from M3 emotional arc and music brief. Style: "${(d.prompt || 'cinematic orchestral').slice(0, 60)}"`,
          color: '#f59e0b',
          bgColor: 'rgba(245,158,11,0.06)',
        })
      }
    }

    // Final output
    if (node?.type === 'finalOutput' || steps.length > 1) {
      steps.push({
        icon: <span className="text-sm">🎬</span>,
        model: 'CineWeave Output',
        role: 'Assembled Cinematic Project',
        detail: 'All generated assets assembled into a synchronized cinematic project with video, narration, and score.',
        color: '#10b981',
        bgColor: 'rgba(16,185,129,0.06)',
      })
    }

    return steps
  }

  const steps = buildLineage()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-end"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => setShowLineagePanel(false)}
      >
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="h-full overflow-y-auto"
          style={{
            width: 380,
            background: 'var(--cw-bg-panel)',
            borderLeft: '1px solid var(--cw-border)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
            style={{ background: 'var(--cw-bg-panel)', borderBottom: '1px solid var(--cw-border)' }}>
            <div>
              <h3 className="text-sm font-semibold text-white/90">Production Lineage</h3>
              <p className="text-[11px] text-white/40 mt-0.5">How this was made</p>
            </div>
            <button
              onClick={() => setShowLineagePanel(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Intro */}
          <div className="px-6 py-4">
            <div className="text-[11px] text-white/40 leading-relaxed rounded-xl px-4 py-3"
              style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              This panel shows how CineWeave connected MiniMax models to produce this output. Each step transforms and enriches the creative intent from the original idea.
            </div>
          </div>

          {/* Steps */}
          <div className="px-6 pb-8">
            {steps.length === 0 ? (
              <div className="text-[12px] text-white/30 italic text-center py-8">
                Run the workflow to see the production lineage.
              </div>
            ) : (
              <div>
                {steps.map((step, i) => (
                  <div key={i}>
                    <StepCard step={step} index={i} />
                    {i < steps.length - 1 && <ConnectorArrow />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Model attribution */}
          <div className="px-6 pb-6">
            <div className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] text-white/30 text-center leading-relaxed">
                Powered by MiniMax M3 · M2.7 · H3 · Speech 2.8 · Music 3.0
                <br />
                <span className="text-white/20">via OpenRouter & GMI Cloud</span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
