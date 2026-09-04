// ─── Node Types ───────────────────────────────────────────────────────────────
export type CWNodeType =
  | 'idea'
  | 'm3Director'
  | 'm27Assistant'
  | 'h3Video'
  | 'speech28'
  | 'music30'
  | 'finalOutput'

export type NodeStatus =
  | 'idle'
  | 'ready'
  | 'running'
  | 'queued'
  | 'processing'
  | 'complete'
  | 'error'

// ─── Cinematic Blueprint (M3 Output) ─────────────────────────────────────────
export interface Scene {
  scene: number
  title: string
  purpose: string
  camera: string
  lighting: string
  emotion: string
  duration_seconds: number
  video_prompt: string
}

export interface EmotionalArc {
  opening: string
  escalation: string
  climax: string
  resolution: string
}

export interface CreativeDirection {
  genre: string
  tone: string
  visual_language: string
  color_palette: string
  cinematography_style: string
}

export interface MusicBrief {
  style: string
  opening: string
  middle: string
  climax: string
  ending: string
  prompt: string
}

export interface NarrationBrief {
  style: string
  text: string
  emotion: string
}

export interface CinematicBlueprint {
  title: string
  logline: string
  creative_direction: CreativeDirection
  emotional_arc: EmotionalArc
  scenes: Scene[]
  music_brief: MusicBrief
  narration: NarrationBrief
  h3_primary_prompt: string
}

// ─── Node Data Types ──────────────────────────────────────────────────────────
export interface IdeaNodeData {
  label: string
  idea: string
  genre: string
  mood: string
  status: NodeStatus
}

export interface M3DirectorNodeData {
  label: string
  status: NodeStatus
  blueprint: CinematicBlueprint | null
  error: string | null
  processingMessage: string
}

export interface M27AssistantNodeData {
  label: string
  status: NodeStatus
  task: string
  result: {
    result: string
    suggestions: string[]
    issues: string[]
    optimized_prompt?: string
  } | null
  error: string | null
}

export interface H3VideoNodeData {
  label: string
  status: NodeStatus
  prompt: string
  resolution: string
  duration: number
  ratio: string
  requestId: string | null
  videoUrl: string | null
  thumbnailUrl: string | null
  error: string | null
  processingMessage: string
}

export interface Speech28NodeData {
  label: string
  status: NodeStatus
  text: string
  voiceId: string
  emotion: string
  speed: number
  requestId: string | null
  audioUrl: string | null
  error: string | null
  processingMessage: string
}

export interface Music30NodeData {
  label: string
  status: NodeStatus
  lyrics: string
  prompt: string
  requestId: string | null
  audioUrl: string | null
  error: string | null
  processingMessage: string
}

export interface FinalOutputNodeData {
  label: string
  status: NodeStatus
  title: string
  videoUrl: string | null
  audioUrl: string | null
  musicUrl: string | null
  blueprint: CinematicBlueprint | null
}

export type CWNodeData =
  | IdeaNodeData
  | M3DirectorNodeData
  | M27AssistantNodeData
  | H3VideoNodeData
  | Speech28NodeData
  | Music30NodeData
  | FinalOutputNodeData

// ─── Workflow Types ───────────────────────────────────────────────────────────
export interface WorkflowNode {
  id: string
  type: CWNodeType
  position: { x: number; y: number }
  data: CWNodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  animated?: boolean
  style?: Record<string, unknown>
  className?: string
}

export type WorkflowStatus = 'idle' | 'validating' | 'running' | 'complete' | 'error'

export interface WorkflowExecutionLog {
  timestamp: number
  nodeId: string
  nodeType: CWNodeType
  message: string
  level: 'info' | 'success' | 'error' | 'warning'
}

// ─── Workflow Templates ───────────────────────────────────────────────────────
export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  icon: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

// ─── Lineage Step ─────────────────────────────────────────────────────────────
export interface LineageStep {
  model: string
  role: string
  description: string
  icon: string
  color: string
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface M3Response {
  success: boolean
  blueprint: CinematicBlueprint
  usage?: { prompt_tokens: number; completion_tokens: number }
}

export interface M27Response {
  success: boolean
  result: {
    result: string
    suggestions: string[]
    issues: string[]
    optimized_prompt?: string
  }
}

export interface GMISubmitResponse {
  success: boolean
  request_id: string
  status: string
}

export interface GMIStatusResponse {
  success: boolean
  request_id: string
  model: string
  status: 'queued' | 'processing' | 'success' | 'failed' | 'cancelled'
  outcome: {
    video_url?: string
    thumbnail_image_url?: string
    media_urls?: { id: string; url: string }[]
    audio_url?: string
  } | null
}

// ─── Voice IDs ────────────────────────────────────────────────────────────────
export const VOICE_IDS = [
  { id: 'English_expressive_narrator', label: 'Expressive Narrator' },
  { id: 'English_young_male_narrator', label: 'Young Male Narrator' },
  { id: 'English_calm_female', label: 'Calm Female' },
  { id: 'English_dramatic_male', label: 'Dramatic Male' },
  { id: 'English_warm_female_narrator', label: 'Warm Female Narrator' },
] as const

export const EMOTION_OPTIONS = [
  'auto', 'calm', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'
] as const

export type EmotionOption = typeof EMOTION_OPTIONS[number]
