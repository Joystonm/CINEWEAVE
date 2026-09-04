import type { WorkflowTemplate } from '../types'

export const TEMPLATES: WorkflowTemplate[] = [
  // ─── Template 1: Cinematic Trailer ─────────────────────────────────────────
  {
    id: 'cinematic-trailer',
    name: 'Cinematic Trailer',
    description: 'Full production pipeline: Idea → M3 Creative Director → H3 Video + Music → Cinematic Output',
    icon: '🎬',
    nodes: [
      {
        id: 'idea-1',
        type: 'idea',
        position: { x: 100, y: 200 },
        data: {
          label: 'Creative Idea',
          idea: '',
          genre: '',
          mood: '',
          status: 'idle',
        },
      },
      {
        id: 'm3-1',
        type: 'm3Director',
        position: { x: 360, y: 200 },
        data: {
          label: 'M3 Creative Director',
          status: 'idle',
          blueprint: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'h3-1',
        type: 'h3Video',
        position: { x: 620, y: 100 },
        data: {
          label: 'H3 Video',
          status: 'idle',
          prompt: '',
          resolution: '2K',
          duration: 5,
          ratio: '16:9',
          requestId: null,
          videoUrl: null,
          thumbnailUrl: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'music-1',
        type: 'music30',
        position: { x: 620, y: 480 },
        data: {
          label: 'Music 3.0',
          status: 'idle',
          lyrics: '',
          prompt: '',
          requestId: null,
          audioUrl: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'output-1',
        type: 'finalOutput',
        position: { x: 900, y: 280 },
        data: {
          label: 'Cinematic Output',
          status: 'idle',
          title: '',
          videoUrl: null,
          audioUrl: null,
          musicUrl: null,
          blueprint: null,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'idea-1', target: 'm3-1' },
      { id: 'e2-3', source: 'm3-1', target: 'h3-1' },
      { id: 'e2-4', source: 'm3-1', target: 'music-1' },
      { id: 'e3-5', source: 'h3-1', target: 'output-1' },
      { id: 'e5-6', source: 'music-1', target: 'output-1' },
    ],
  },

  // ─── Template 2: Music Video ────────────────────────────────────────────────
  {
    id: 'music-video',
    name: 'Music Video',
    description: 'Song concept → M3 Visual Direction → Music 3.0 + H3 Visual → Output',
    icon: '🎵',
    nodes: [
      {
        id: 'idea-1',
        type: 'idea',
        position: { x: 100, y: 250 },
        data: {
          label: 'Song Concept',
          idea: '',
          genre: 'Music Video',
          mood: '',
          status: 'idle',
        },
      },
      {
        id: 'm3-1',
        type: 'm3Director',
        position: { x: 360, y: 150 },
        data: {
          label: 'M3 Visual Concept',
          status: 'idle',
          blueprint: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'music-1',
        type: 'music30',
        position: { x: 640, y: 150 },
        data: {
          label: 'Music 3.0',
          status: 'idle',
          lyrics: '',
          prompt: '',
          requestId: null,
          audioUrl: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'h3-1',
        type: 'h3Video',
        position: { x: 640, y: 350 },
        data: {
          label: 'H3 Visual',
          status: 'idle',
          prompt: '',
          resolution: '2K',
          duration: 10,
          ratio: '16:9',
          requestId: null,
          videoUrl: null,
          thumbnailUrl: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'output-1',
        type: 'finalOutput',
        position: { x: 920, y: 250 },
        data: {
          label: 'Music Video Output',
          status: 'idle',
          title: '',
          videoUrl: null,
          audioUrl: null,
          musicUrl: null,
          blueprint: null,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'idea-1', target: 'm3-1' },
      { id: 'e2-3', source: 'm3-1', target: 'music-1' },
      { id: 'e2-4', source: 'm3-1', target: 'h3-1' },
      { id: 'e3-5', source: 'music-1', target: 'output-1' },
      { id: 'e4-5', source: 'h3-1', target: 'output-1' },
    ],
  },

  // ─── Template 3: AI Short Film ──────────────────────────────────────────────
  {
    id: 'ai-short-film',
    name: 'AI Short Film',
    description: 'Full short film pipeline: Story → M3 Story Director → Scenes + Speech + Music → Final Project',
    icon: '🎭',
    nodes: [
      {
        id: 'idea-1',
        type: 'idea',
        position: { x: 60, y: 280 },
        data: {
          label: 'Story Idea',
          idea: '',
          genre: '',
          mood: '',
          status: 'idle',
        },
      },
      {
        id: 'm3-1',
        type: 'm3Director',
        position: { x: 300, y: 180 },
        data: {
          label: 'M3 Story Director',
          status: 'idle',
          blueprint: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'h3-1',
        type: 'h3Video',
        position: { x: 580, y: 80 },
        data: {
          label: 'H3 Scene',
          status: 'idle',
          prompt: '',
          resolution: '2K',
          duration: 10,
          ratio: '16:9',
          requestId: null,
          videoUrl: null,
          thumbnailUrl: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'speech-1',
        type: 'speech28',
        position: { x: 580, y: 280 },
        data: {
          label: 'Speech 2.8',
          status: 'idle',
          text: '',
          voiceId: 'English_expressive_narrator',
          emotion: 'calm',
          speed: 0.9,
          requestId: null,
          audioUrl: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'music-1',
        type: 'music30',
        position: { x: 580, y: 460 },
        data: {
          label: 'Music 3.0',
          status: 'idle',
          lyrics: '',
          prompt: '',
          requestId: null,
          audioUrl: null,
          error: null,
          processingMessage: '',
        },
      },
      {
        id: 'output-1',
        type: 'finalOutput',
        position: { x: 880, y: 260 },
        data: {
          label: 'Final Project',
          status: 'idle',
          title: '',
          videoUrl: null,
          audioUrl: null,
          musicUrl: null,
          blueprint: null,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'idea-1', target: 'm3-1' },
      { id: 'e2-3', source: 'm3-1', target: 'h3-1' },
      { id: 'e2-4', source: 'm3-1', target: 'speech-1' },
      { id: 'e2-5', source: 'm3-1', target: 'music-1' },
      { id: 'e3-6', source: 'h3-1', target: 'output-1' },
      { id: 'e4-6', source: 'speech-1', target: 'output-1' },
      { id: 'e5-6', source: 'music-1', target: 'output-1' },
    ],
  },
]

// ─── Demo Workflow ────────────────────────────────────────────────────────────
export const DEMO_WORKFLOW = {
  nodes: TEMPLATES[0].nodes.filter((n) => n.type !== 'speech28').map((n) => {
    if (n.type === 'idea') {
      return {
        ...n,
        data: {
          ...n.data,
          idea: 'A former boxer walks alone through a rain-soaked Mumbai street at midnight. He receives a phone call that changes everything.',
          genre: 'Crime Thriller / Noir',
          mood: 'Tense, melancholic, cinematic',
          status: 'ready',
        },
      }
    }
    return n
  }),
  edges: TEMPLATES[0].edges.filter((e) => {
    // Remove edges connected to speech28 node
    const speechNode = TEMPLATES[0].nodes.find((n) => n.type === 'speech28')
    if (speechNode && (e.source === speechNode.id || e.target === speechNode.id)) {
      return false
    }
    return true
  }),
}
