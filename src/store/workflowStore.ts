import { create } from 'zustand'
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowStatus,
  WorkflowExecutionLog,
  CWNodeType,
  NodeStatus,
} from '../types'
import { TEMPLATES, DEMO_WORKFLOW } from '../services/templates'

interface WorkflowStore {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  workflowName: string
  workflowStatus: WorkflowStatus
  selectedNodeId: string | null
  executionLog: WorkflowExecutionLog[]
  showLanding: boolean
  showLineagePanel: boolean
  lineagePanelNodeId: string | null

  addNode: (type: CWNodeType, position: { x: number; y: number }) => void
  removeNode: (id: string) => void
  removeEdge: (id: string) => void
  updateNodeData: (id: string, data: Partial<WorkflowNode['data']>) => void
  updateNodeStatus: (id: string, status: NodeStatus) => void
  setSelectedNode: (id: string | null) => void
  setEdgeAnimated: (id: string, animated: boolean) => void

  setWorkflowStatus: (status: WorkflowStatus) => void
  setWorkflowName: (name: string) => void
  clearWorkflow: () => void
  loadTemplate: (templateId: string) => void
  loadDemoWorkflow: () => void

  addLog: (entry: Omit<WorkflowExecutionLog, 'timestamp'>) => void
  clearLog: () => void

  setShowLanding: (show: boolean) => void
  setShowLineagePanel: (show: boolean, nodeId?: string) => void

  // Called by canvas to sync positions/edges back
  syncNodesFromFlow: (updates: { id: string; position: { x: number; y: number } }[]) => void
  syncEdgesFromFlow: (edges: { id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string }[]) => void
}

function makeNodeData(type: CWNodeType): WorkflowNode['data'] {
  switch (type) {
    case 'idea':
      return { label: 'Creative Idea', idea: '', genre: '', mood: '', status: 'idle' }
    case 'm3Director':
      return { label: 'M3 Creative Director', status: 'idle', blueprint: null, error: null, processingMessage: '' }
    case 'm27Assistant':
      return { label: 'M2.7 Assistant', status: 'idle', task: '', result: null, error: null }
    case 'h3Video':
      return { label: 'H3 Video', status: 'idle', prompt: '', resolution: '2K', duration: 5, ratio: '16:9', requestId: null, videoUrl: null, thumbnailUrl: null, error: null, processingMessage: '' }
    case 'speech28':
      return { label: 'Speech 2.8', status: 'idle', text: '', voiceId: 'English_expressive_narrator', emotion: 'auto', speed: 1, requestId: null, audioUrl: null, error: null, processingMessage: '' }
    case 'music30':
      return { label: 'Music 3.0', status: 'idle', lyrics: '', prompt: '', requestId: null, audioUrl: null, error: null, processingMessage: '' }
    case 'finalOutput':
      return { label: 'Final Output', status: 'idle', title: '', videoUrl: null, audioUrl: null, musicUrl: null, blueprint: null }
    default:
      return { label: 'Node', status: 'idle' } as unknown as WorkflowNode['data']
  }
}

let counter = 100

export const useWorkflowStore = create<WorkflowStore>()((set) => ({
  nodes: [],
  edges: [],
  workflowName: 'Untitled Workflow',
  workflowStatus: 'idle',
  selectedNodeId: null,
  executionLog: [],
  showLanding: true,
  showLineagePanel: false,
  lineagePanelNodeId: null,

  addNode: (type, position) => {
    const id = `${type}-${++counter}`
    const node: WorkflowNode = { id, type, position, data: makeNodeData(type) }
    set((s) => ({ nodes: [...s.nodes, node] }))
  },

  removeNode: (id) => set((s) => ({
    nodes: s.nodes.filter((n) => n.id !== id),
    edges: s.edges.filter((e) => e.source !== id && e.target !== id),
    selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
  })),

  removeEdge: (id) => set((s) => ({
    edges: s.edges.filter((e) => e.id !== id),
  })),

  updateNodeData: (id, data) => set((s) => ({
    nodes: s.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...data } } : n),
  })),

  updateNodeStatus: (id, status) => set((s) => ({
    nodes: s.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, status } } : n),
  })),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  setEdgeAnimated: (id, animated) => set((s) => ({
    edges: s.edges.map((e) => e.id === id ? { ...e, animated } : e),
  })),

  setWorkflowStatus: (status) => set({ workflowStatus: status }),
  setWorkflowName: (name) => set({ workflowName: name }),

  clearWorkflow: () => set({
    nodes: [], edges: [], workflowName: 'Untitled Workflow',
    workflowStatus: 'idle', selectedNodeId: null, executionLog: [],
  }),

  loadTemplate: (templateId) => {
    const t = TEMPLATES.find((t) => t.id === templateId)
    if (!t) return
    set({ nodes: t.nodes as WorkflowNode[], edges: t.edges, workflowName: t.name, workflowStatus: 'idle', selectedNodeId: null, executionLog: [] })
  },

  loadDemoWorkflow: () => set({
    nodes: DEMO_WORKFLOW.nodes as WorkflowNode[],
    edges: DEMO_WORKFLOW.edges,
    workflowName: 'Mumbai Noir — Demo',
    workflowStatus: 'idle',
    selectedNodeId: null,
    executionLog: [],
  }),

  addLog: (entry) => set((s) => ({
    executionLog: [...s.executionLog, { ...entry, timestamp: Date.now() }],
  })),

  clearLog: () => set({ executionLog: [] }),

  setShowLanding: (show) => set({ showLanding: show }),
  setShowLineagePanel: (show, nodeId) => set({ showLineagePanel: show, lineagePanelNodeId: nodeId || null }),

  syncNodesFromFlow: (updates) => set((s) => ({
    nodes: s.nodes.map((n) => {
      const u = updates.find((u) => u.id === n.id)
      return u ? { ...n, position: u.position } : n
    }),
  })),

  syncEdgesFromFlow: (newEdges) => set((s) => {
    // Merge new edges into existing ones — never replace the entire array
    const merged = [...s.edges]
    for (const e of newEdges) {
      const idx = merged.findIndex((se) => se.id === e.id)
      if (idx >= 0) {
        // Update existing edge, preserving full properties
        merged[idx] = { ...e, ...merged[idx] }
      } else {
        // Add new edge
        merged.push(e)
      }
    }
    return { edges: merged }
  }),
}))
