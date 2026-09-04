import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useWorkflowStore } from '../../store/workflowStore'
import { IdeaNode } from '../nodes/IdeaNode'
import { M3DirectorNode } from '../nodes/M3DirectorNode'
import { M27AssistantNode } from '../nodes/M27AssistantNode'
import { H3VideoNode } from '../nodes/H3VideoNode'
import { Speech28Node } from '../nodes/Speech28Node'
import { Music30Node } from '../nodes/Music30Node'
import { FinalOutputNode } from '../nodes/FinalOutputNode'

const NODE_TYPES = {
  idea: IdeaNode,
  m3Director: M3DirectorNode,
  m27Assistant: M27AssistantNode,
  h3Video: H3VideoNode,
  speech28: Speech28Node,
  music30: Music30Node,
  finalOutput: FinalOutputNode,
}

function CanvasInner() {
  const { fitView } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode)
  const syncNodesFromFlow = useWorkflowStore((s) => s.syncNodesFromFlow)
  const syncEdgesFromFlow = useWorkflowStore((s) => s.syncEdgesFromFlow)

  // Track previous node IDs to detect structural changes
  const prevNodeIds = useRef<string[]>([])
  // Track previous node data to detect status/data changes (not just structural)
  const prevNodeData = useRef<Record<string, unknown>>({})
  // Ref to track ReactFlow edges
  const rfEdgesRef = useRef<Edge[]>([])

  useEffect(() => {
    let fitPending = false

    function maybeSync() {
      const state = useWorkflowStore.getState()

      const nodeIds = state.nodes.map((n) => n.id)
      const nodeIdsChanged =
        nodeIds.length !== prevNodeIds.current.length ||
        !nodeIds.every((id, i) => id === prevNodeIds.current[i])

      // Also check if any node's data content changed (e.g. status update)
      const dataChanged = state.nodes.some((n) => {
        const prev = prevNodeData.current[n.id]
        return JSON.stringify(prev) !== JSON.stringify(n.data)
      })

      if (!nodeIdsChanged && !dataChanged) return

      prevNodeIds.current = nodeIds
      // Update prevNodeData
      for (const n of state.nodes) {
        prevNodeData.current[n.id] = n.data
      }

      const rfNodes: Node[] = state.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: { ...n.position },
        data: { ...(n.data as object) } as Record<string, unknown>,
      }))

      // Keep existing ReactFlow edges — never overwrite them from the store
      const rfEdges = rfEdgesRef.current

      setNodes(rfNodes)
      // Only sync nodes, NOT edges — edges are managed exclusively by ReactFlow's event handlers

      if (rfNodes.length > 0 && !fitPending) {
        fitPending = true
        setTimeout(() => { fitView({ padding: 0.2, duration: 300 }); fitPending = false }, 80)
      }
    }

    maybeSync()
    const unsub = useWorkflowStore.subscribe(maybeSync)
    return unsub
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep rfEdgesRef in sync with actual ReactFlow edge state
  useEffect(() => {
    rfEdgesRef.current = edges
  }, [edges])

  // Initialize ReactFlow with store's nodes AND edges on first mount (for template loading)
  useEffect(() => {
    const state = useWorkflowStore.getState()
    if (state.nodes.length === 0) return

    const rfNodes: Node[] = state.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { ...n.position },
      data: { ...(n.data as object) } as Record<string, unknown>,
    }))

    const rfEdges: Edge[] = state.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      type: 'smoothstep',
      animated: !!e.animated,
      style: e.animated
        ? { stroke: 'rgba(139,92,246,0.8)', strokeWidth: 2 }
        : { stroke: 'rgba(139,92,246,0.45)', strokeWidth: 1.5 },
    }))

    setNodes(rfNodes)
    setEdges(rfEdges)
    rfEdgesRef.current = rfEdges
    prevNodeIds.current = state.nodes.map((n) => n.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Sync deletions to Zustand store so store and ReactFlow stay in sync
    for (const change of changes) {
      if (change.type === 'remove') {
        useWorkflowStore.getState().removeEdge(change.id)
      }
    }
    onEdgesChange(changes)
  }, [onEdgesChange])

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Sync deletions to Zustand store so store and ReactFlow stay in sync
    for (const change of changes) {
      if (change.type === 'remove') {
        useWorkflowStore.getState().removeNode(change.id)
      }
    }
    onNodesChange(changes)
  }, [onNodesChange])

  const handleConnect = useCallback((connection: Connection) => {
    const id = `e-${connection.source}-${connection.target}-${Date.now()}`
    const newEdge: Edge = {
      id,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
      type: 'smoothstep',
      style: { stroke: 'rgba(139,92,246,0.5)', strokeWidth: 1.5 },
    }
    setEdges((eds) => addEdge(newEdge, eds))
    syncEdgesFromFlow([{ id, source: connection.source, target: connection.target }])
  }, [setEdges, syncEdgesFromFlow])

  const handleNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    syncNodesFromFlow([{ id: node.id, position: node.position }])
  }, [syncNodesFromFlow])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {nodes.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ fontSize: 48 }}>🎬</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Canvas is empty</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
            Click a node in the sidebar to add it, or load a template
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        nodeTypes={NODE_TYPES}
        minZoom={0.3}
        maxZoom={2}
        deleteKeyCode="Delete"
        connectionRadius={40}
        style={{ width: '100%', height: '100%' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="rgba(139,92,246,0.12)"
          style={{ background: '#1a1a2e' }}
        />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          style={{ height: 80, width: 120, background: '#1a1a2e' }}
          nodeColor={(n) => ({
            idea: '#6366f1', m3Director: '#8b5cf6', m27Assistant: '#6366f1',
            h3Video: '#db2777', speech28: '#0891b2', music30: '#d97706',
            finalOutput: '#10b981',
          }[n.type || ''] || '#444')}
          maskColor="rgba(0,0,0,0.4)"
        />
      </ReactFlow>
    </div>
  )
}

export function WorkflowCanvas() {
  return <CanvasInner />
}
