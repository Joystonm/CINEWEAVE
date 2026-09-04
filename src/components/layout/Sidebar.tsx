import { useState } from 'react'
import {
  Sparkles, Film, Mic2, Music, Lightbulb, Clapperboard,
  Layout, Plus, ChevronDown, ChevronRight, Wand2
} from 'lucide-react'
import { useWorkflowStore } from '../../store/workflowStore'
import { TEMPLATES } from '../../services/templates'
import type { CWNodeType } from '../../types'

interface NodeDef {
  type: CWNodeType
  label: string
  sub: string
  icon: React.ReactNode
  color: string
}

const NODE_DEFS: NodeDef[] = [
  { type: 'idea', label: 'Creative Idea', sub: 'Starting point', icon: <Lightbulb size={13} />, color: '#6366f1' },
  { type: 'm3Director', label: 'M3 Creative Director', sub: 'Cinematic reasoning', icon: <Sparkles size={13} />, color: '#8b5cf6' },
  { type: 'h3Video', label: 'H3 Video', sub: 'Cinematic generation', icon: <Film size={13} />, color: '#db2777' },
  { type: 'speech28', label: 'Speech 2.8', sub: 'Narration & voice', icon: <Mic2 size={13} />, color: '#0891b2' },
  { type: 'music30', label: 'Music 3.0', sub: 'Cinematic score', icon: <Music size={13} />, color: '#d97706' },
  { type: 'finalOutput', label: 'Final Output', sub: 'Project assembly', icon: <Clapperboard size={13} />, color: '#10b981' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}
      >
        {open ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
        {title}
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

function NodeItem({ def }: { def: NodeDef }) {
  const addNode = useWorkflowStore((s) => s.addNode)

  return (
    <button
      onClick={() => {
        addNode(def.type, { x: 200 + Math.random() * 300, y: 150 + Math.random() * 300 })
      }}
      style={{
        width: 'calc(100% - 8px)', margin: '0 4px',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px', background: 'none', border: 'none',
        cursor: 'pointer', borderRadius: 6, textAlign: 'left',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${def.color}18`, border: `1px solid ${def.color}30`,
        color: def.color,
      }}>
        {def.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {def.label}
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{def.sub}</div>
      </div>
      <Plus size={10} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
    </button>
  )
}

export function Sidebar() {
  const { loadTemplate, loadDemoWorkflow, clearWorkflow, workflowName, setShowLanding } = useWorkflowStore()

  return (
    <div style={{
      width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
      background: '#1a1a2e', borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => setShowLanding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
          }}>
            <Sparkles size={12} color="#a78bfa" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>CineWeave</span>
        </button>
      </div>

      {/* Scrollable area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

        {/* Workflow */}
        <Section title="Workflow">
          <div style={{ padding: '0 12px 8px' }}>
            <button
              onClick={clearWorkflow}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer',
                borderRadius: 8, color: 'rgba(255,255,255,0.55)', fontSize: 11,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <Plus size={11} /> New Workflow
            </button>
            {workflowName !== 'Untitled Workflow' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                <Layout size={10} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workflowName}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Templates */}
        <Section title="Templates">
          <div style={{ padding: '0 12px 8px' }}>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => loadTemplate(t.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer',
                  borderRadius: 8, color: 'rgba(255,255,255,0.55)', fontSize: 11, textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <span>{t.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Demo */}
        <div style={{ padding: '4px 12px 8px' }}>
          <button
            onClick={() => loadDemoWorkflow()}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
              color: '#a78bfa', fontSize: 11, fontWeight: 500,
            }}
          >
            <Wand2 size={12} /> ✨ Load Demo Workflow
          </button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '4px 0' }} />

        {/* Intelligence nodes */}
        <Section title="Intelligence">
          {NODE_DEFS.filter((n) => ['idea', 'm3Director'].includes(n.type)).map((def) => (
            <NodeItem key={def.type} def={def} />
          ))}
        </Section>

        {/* Generation nodes */}
        <Section title="Generation">
          {NODE_DEFS.filter((n) => ['h3Video', 'speech28', 'music30'].includes(n.type)).map((def) => (
            <NodeItem key={def.type} def={def} />
          ))}
        </Section>

        {/* Output nodes */}
        <Section title="Output">
          {NODE_DEFS.filter((n) => ['finalOutput'].includes(n.type)).map((def) => (
            <NodeItem key={def.type} def={def} />
          ))}
        </Section>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 16px' }}>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
          MiniMax M3 · M2.7 · H3 · Speech · Music
        </p>
      </div>
    </div>
  )
}
