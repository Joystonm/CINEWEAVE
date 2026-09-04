import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Play, Sparkles, ArrowRight, Film, Mic2, Music, Zap, Lightbulb, Clapperboard, Workflow, Star, Quote } from 'lucide-react'
import { useWorkflowStore } from '../store/workflowStore'
import { TEMPLATES } from '../services/templates'

// ─── Custom cursor follower ────────────────────────────────────────────────────
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: -100, y: -100 })

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      ref={ref}
      className="fixed pointer-events-none z-0"
      style={{
        width: 480,
        height: 480,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        left: pos.x - 240,
        top: pos.y - 240,
        transform: 'translate(0, 0)',
        transition: 'left 0.4s ease-out, top 0.4s ease-out',
      }}
    />
  )
}

// ─── Node badge ───────────────────────────────────────────────────────────────
function NodeBadge({ label, color, delay = 0 }: { label: string; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </motion.div>
  )
}

// ─── Model item for horizontal showcase ──────────────────────────────────────
function ModelItem({ model, index }: { model: typeof MODELS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 w-72 rounded-2xl p-6 relative overflow-hidden group"
      style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${model.color}, transparent)` }} />

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${model.color}12` }}>
        <span style={{ color: model.color }}>{model.icon}</span>
      </div>

      {/* Badge */}
      <div className="text-[9px] font-bold uppercase tracking-widest mb-2"
        style={{ color: model.color }}>{model.badge}</div>

      {/* Name & role */}
      <div className="text-[15px] font-bold mb-0.5" style={{ color: '#111118', letterSpacing: '-0.02em' }}>
        {model.name}
      </div>
      <div className="text-[11px] mb-3" style={{ color: '#888' }}>{model.role}</div>

      {/* Desc */}
      <p className="text-[12px] leading-relaxed" style={{ color: '#666' }}>{model.desc}</p>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 right-0 w-20 h-20 rounded-tl-full opacity-5"
        style={{ background: model.color }} />
    </motion.div>
  )
}

// ─── Stat ────────────────────────────────────────────────────────────────────
function Stat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <div className="text-3xl font-bold" style={{ color: '#111118', letterSpacing: '-0.04em' }}>{value}</div>
      <div className="text-[11px] mt-0.5" style={{ color: '#aaa' }}>{label}</div>
    </motion.div>
  )
}

// ─── Models data ─────────────────────────────────────────────────────────────
const MODELS = [
  {
    name: 'MiniMax M3',
    role: 'Creative Director',
    desc: 'Transforms raw ideas into structured cinematic blueprints with narrative reasoning, scene planning, and visual direction.',
    icon: <Sparkles size={18} />,
    color: '#7c3aed',
    badge: 'OpenRouter',
  },
  {
    name: 'MiniMax H3',
    role: 'Video Generation',
    desc: 'Frontier cinematic video model. Generates 2K footage from precisely directed prompts crafted by the pipeline.',
    icon: <Film size={18} />,
    color: '#db2777',
    badge: 'GMI Cloud',
  },
  {
    name: 'MiniMax Speech 2.8',
    role: 'Narration Engine',
    desc: 'Ultra-expressive text-to-speech with emotional control, voice selection, and cinematic narration delivery.',
    icon: <Mic2 size={18} />,
    color: '#0891b2',
    badge: 'GMI Cloud',
  },
  {
    name: 'MiniMax Music 3.0',
    role: 'Score Composer',
    desc: 'Generates cinematic soundtracks from M3-crafted emotional arcs and music briefs. Complete songs with structure.',
    icon: <Music size={18} />,
    color: '#d97706',
    badge: 'GMI Cloud',
  },
  {
    name: 'MiniMax M2.7',
    role: 'Workflow Assistant',
    desc: 'Fast workflow intelligence — validates connections, refines prompts, optimizes parameters for downstream models.',
    icon: <Zap size={18} />,
    color: '#6d28d9',
    badge: 'OpenRouter',
  },
]

// ─── Main Landing Page ────────────────────────────────────────────────────────
export function LandingPage() {
  const { setShowLanding, loadTemplate, loadDemoWorkflow } = useWorkflowStore()

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60])

  const handleStart = () => { loadTemplate('cinematic-trailer'); setShowLanding(false) }
  const handleDemo = () => { loadDemoWorkflow(); setShowLanding(false) }

  return (
    <div
      className="landing-page min-h-screen overflow-x-hidden"
      style={{ background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif' }}
    >
      <CursorGlow />

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d2d4a)' }}>
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight" style={{ color: '#111118' }}>CineWeave</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {['Models', 'Templates', 'Docs'].map((item) => (
            <button key={item} className="px-4 py-2 text-[13px] rounded-lg transition-colors cursor-pointer"
              style={{ color: '#888' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}>
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: '#1a1a2e' }}
          >
            <Play size={11} className="fill-white" />
            Start Creating
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative px-8 pt-20 pb-32 overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
          }}
        />

        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 right-[8%] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-40 left-[5%] w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(219,39,119,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium mb-8"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', color: '#7c3aed' }}
              >
                <Star size={9} />
                GMI Cloud × MiniMaxathon 2026
              </motion.div>

              {/* Headline — very large, editorial */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="leading-[1.05]"
                style={{ fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#111118' }}
              >
                Where AI
                <br />
                <span style={{ color: '#7c3aed' }}>becomes</span>
                <br />
                cinema.
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-6 text-base max-w-md leading-relaxed"
                style={{ color: '#666' }}
              >
                Build visual workflows that connect MiniMax reasoning, video, voice, and music
                into intelligent cinematic pipelines. Drag, connect, create.
              </motion.p>

              {/* CTA row */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mt-8 flex items-center gap-3 flex-wrap"
              >
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: '#1a1a2e', boxShadow: '0 4px 20px rgba(26,26,46,0.2)' }}
                >
                  <Play size={12} className="fill-white" />
                  Start Creating
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={handleDemo}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-[13px] font-medium transition-all hover:scale-[1.02]"
                  style={{ color: '#555', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}
                >
                  See demo
                </button>
              </motion.div>

              {/* Model badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-10 flex flex-wrap gap-2"
              >
                <NodeBadge label="M3 Creative Director" color="#7c3aed" delay={0.75} />
                <NodeBadge label="H3 Video" color="#db2777" delay={0.8} />
                <NodeBadge label="Speech 2.8" color="#0891b2" delay={0.85} />
                <NodeBadge label="Music 3.0" color="#d97706" delay={0.9} />
              </motion.div>
            </div>

            {/* Right: Floating workflow preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Main card */}
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: '#1a1a2e',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f87171' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fbbf24' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#34d399' }} />
                  <div className="flex-1" />
                  <div className="text-[9px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                    CineWeave Studio
                  </div>
                </div>

                {/* Workflow preview content */}
                <div className="p-5">
                  {/* Nodes row */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Idea node */}
                    <div className="rounded-xl p-3 w-28"
                      style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb size={10} style={{ color: '#6366f1' }} />
                        <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Idea</span>
                      </div>
                      <div className="text-[8px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Mumbai Noir scene...
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-1 flex items-center justify-center">
                      <motion.div
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowRight size={12} style={{ color: 'rgba(139,92,246,0.6)' }} />
                      </motion.div>
                    </div>

                    {/* M3 node */}
                    <div className="rounded-xl p-3 w-28"
                      style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles size={10} style={{ color: '#8b5cf6' }} />
                        <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>M3</span>
                        <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                      </div>
                      <div className="text-[8px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Blueprint ready
                      </div>
                    </div>
                  </div>

                  {/* Connection line */}
                  <div className="h-6 flex items-center justify-center my-1">
                    <motion.div
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                      className="w-0.5 h-full rounded-full"
                      style={{ background: 'linear-gradient(to bottom, rgba(139,92,246,0.4), rgba(219,39,119,0.4))' }}
                    />
                  </div>

                  {/* H3 / Music row */}
                  <div className="flex items-center justify-between gap-2">
                    {/* H3 node */}
                    <div className="rounded-xl p-3 w-28"
                      style={{ background: 'rgba(219,39,119,0.1)', border: '1px solid rgba(219,39,119,0.2)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Film size={10} style={{ color: '#ec4899' }} />
                        <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>H3</span>
                        <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#fbbf24' }} />
                      </div>
                      <div className="text-[8px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Generating...
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-1 flex items-center justify-center">
                      <ArrowRight size={12} style={{ color: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Music node */}
                    <div className="rounded-xl p-3 w-28"
                      style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Music size={10} style={{ color: '#f59e0b' }} />
                        <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>Music</span>
                        <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                      </div>
                      <div className="text-[8px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Score ready
                      </div>
                    </div>
                  </div>

                  {/* Status bar */}
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Workflow complete · Cinematic project ready</span>
                  </div>
                </div>
              </div>

              {/* Floating accent card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 -left-6 px-4 py-3 rounded-xl"
                style={{
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.1)' }}>
                    <Clapperboard size={14} style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold" style={{ color: '#111118' }}>Mumbai Noir</div>
                    <div className="text-[9px]" style={{ color: '#aaa' }}>3 nodes · 2 outputs</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-8 pb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 divide-x divide-black/5">
          <Stat value="5" label="MiniMax Models" delay={0} />
          <Stat value="3" label="Output Types" delay={0.1} />
          <Stat value="∞" label="Workflow Combinations" delay={0.2} />
        </div>
      </section>

      {/* ── What it does — alternating layout ── */}
      <section className="px-8 pb-24 max-w-6xl mx-auto">
        <div className="space-y-24">

          {/* Feature 1: Visual workflow */}
          <FeatureBlock
            tag="Visual Pipeline"
            headline={<>Drag, connect,<br />create.</>}
            desc="Build workflows by dragging nodes onto a canvas and connecting them. No code required. M3 plans the narrative, H3 generates footage, Speech adds narration, Music composes the score — all in one visual pipeline."
            delay={0}
            right={
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-black/5">
                <div className="flex items-center gap-3 mb-4">
                  {['idea', 'm3', 'h3', 'music'].map((type, i) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className="w-14 rounded-lg p-2 text-center" style={{
                        background: ['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.1)', 'rgba(219,39,119,0.1)', 'rgba(217,119,6,0.1)'][i],
                        border: ['1px solid rgba(99,102,241,0.2)', '1px solid rgba(139,92,246,0.2)', '1px solid rgba(219,39,119,0.2)', '1px solid rgba(217,119,6,0.2)'][i]
                      }}>
                        <span className="text-[8px] font-bold" style={{ color: ['#6366f1', '#8b5cf6', '#db2777', '#d97706'][i] }}>
                          {['IDEA', 'M3', 'H3', 'MSC'].map(t => t[i])}
                        </span>
                      </div>
                      {i < 3 && <ArrowRight size={10} className="text-gray-300" />}
                    </div>
                  ))}
                </div>
                <div className="h-px mb-3" style={{ background: 'rgba(0,0,0,0.05)' }} />
                <div className="space-y-1.5">
                  {['M3 generates cinematic blueprint', 'H3 renders 2K footage', 'Speech narrates the scene', 'Music scores the emotional arc'].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]" style={{ color: '#666' }}>
                      <div className="w-1 h-1 rounded-full" style={{ background: '#7c3aed' }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            }
          />

          {/* Feature 2: Intelligence */}
          <FeatureBlock
            tag="AI Intelligence"
            headline={<>M3 thinks,<br />everything else creates.</>}
            desc="MiniMax M3 is your creative director — it analyzes your idea and generates a complete cinematic blueprint: scene breakdowns, camera directions, emotional arcs, music briefs, and narration scripts. Everything downstream is driven by this blueprint."
            delay={0.2}
            flip
            right={
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-black/5">
                <div className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: '#aaa' }}>Cinematic Blueprint</div>
                {[
                  { label: 'Title', value: 'Mumbai Noir — Scene 3' },
                  { label: 'Genre', value: 'Crime Thriller' },
                  { label: 'Tone', value: 'Dark, tense, atmospheric' },
                  { label: 'Camera', value: 'Dutch angle, slow push-in' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                    <span className="text-[10px]" style={{ color: '#aaa' }}>{label}</span>
                    <span className="text-[11px] font-medium" style={{ color: '#333' }}>{value}</span>
                  </div>
                ))}
                <div className="mt-3 p-2.5 rounded-lg text-[9px] leading-relaxed" style={{ background: 'rgba(139,92,246,0.05)', color: '#7c3aed' }}>
                  "Close-up on Vijay's face. Rain streaks across his knuckles. A single tear. Cut to wide shot of empty street."
                </div>
              </div>
            }
          />
        </div>
      </section>

      {/* ── Models — horizontal scroll showcase ── */}
      <section className="px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#bbb' }}>Models</div>
            <h2 className="text-3xl font-bold" style={{ color: '#111118', letterSpacing: '-0.03em' }}>
              Five models.
            </h2>
            <h2 className="text-3xl font-bold" style={{ color: '#ccc', letterSpacing: '-0.03em' }}>
              One pipeline.
            </h2>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}>
            {MODELS.map((m, i) => <ModelItem key={m.name} model={m} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Templates ── */}
      <section className="px-8 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#bbb' }}>Templates</div>
          <h2 className="text-3xl font-bold" style={{ color: '#111118', letterSpacing: '-0.03em' }}>Start creating.</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t: { id: string; icon: string; name: string; description: string }, i: number) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              viewport={{ once: true }}
              onClick={() => { loadTemplate(t.id); setShowLanding(false) }}
              className="rounded-2xl p-6 text-left transition-all hover:scale-[1.01] cursor-pointer group"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div className="text-3xl mb-4">{t.icon}</div>
              <div className="text-[15px] font-bold mb-1.5" style={{ color: '#111118' }}>{t.name}</div>
              <p className="text-[12px] leading-relaxed mb-4" style={{ color: '#666' }}>{t.description}</p>
              <div className="flex items-center gap-1 text-[11px] font-medium transition-all"
                style={{ color: '#7c3aed' }}>
                <span>Load workflow</span>
                <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Demo CTA ── */}
      <section className="px-8 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="mb-6">
            <Quote size={32} className="mx-auto" style={{ color: '#ddd' }} />
          </div>
          <p className="text-2xl md:text-3xl font-bold leading-snug mb-6"
            style={{ color: '#111118', letterSpacing: '-0.03em' }}>
            A former boxer's midnight phone call.
            <br />
            <span style={{ color: '#aaa', fontWeight: 400 }}>From idea to cinematic pipeline in minutes.</span>
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleDemo}
              className="flex items-center gap-2 px-7 py-4 rounded-xl text-[13px] font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: '#1a1a2e', boxShadow: '0 4px 20px rgba(26,26,46,0.2)' }}
            >
              <Sparkles size={13} />
              Open Demo Workflow
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-4 rounded-xl text-[13px] font-medium transition-all"
              style={{ color: '#666', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}
            >
              Start from scratch
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-8 py-8" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#1a1a2e' }}>
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="text-[12px] font-medium" style={{ color: '#aaa' }}>CineWeave</span>
          </div>
          <p className="text-[11px]" style={{ color: '#ccc' }}>
            Built for GMI Cloud × MiniMaxathon 2026
          </p>
        </div>
      </footer>
    </div>
  )
}

// ─── Feature Block ────────────────────────────────────────────────────────────
function FeatureBlock({ tag, headline, desc, right, delay, flip = false }: {
  tag: string
  headline: React.ReactNode
  desc: string
  right: React.ReactNode
  delay: number
  flip?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="grid lg:grid-cols-2 gap-16 items-center"
    >
      <div className={flip ? 'lg:order-2' : 'lg:order-1'}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#7c3aed' }}>{tag}</div>
        <h3 className="text-4xl font-bold leading-tight" style={{ color: '#111118', letterSpacing: '-0.03em' }}>
          {headline}
        </h3>
        <p className="mt-4 text-[14px] leading-relaxed max-w-md" style={{ color: '#666' }}>
          {desc}
        </p>
      </div>
      <div className={flip ? 'lg:order-1' : 'lg:order-2'}>
        {right}
      </div>
    </motion.div>
  )
}
