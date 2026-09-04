import { useWorkflowStore } from '../store/workflowStore'
import {
  callM3Director,
  callM27Assistant,
  submitH3Video,
  submitSpeech,
  submitMusic,
  pollUntilComplete,
} from './api'
import type {
  WorkflowNode,
  WorkflowEdge,
  IdeaNodeData,
  M3DirectorNodeData,
  M27AssistantNodeData,
  H3VideoNodeData,
  Speech28NodeData,
  Music30NodeData,
  CinematicBlueprint,
} from '../types'
import { EMOTION_OPTIONS } from '../types'

// ─── Topological Sort ─────────────────────────────────────────────────────────
function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const adjList = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  for (const node of nodes) {
    adjList.set(node.id, [])
    inDegree.set(node.id, 0)
  }

  for (const edge of edges) {
    adjList.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id)
  }

  const sorted: WorkflowNode[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    const node = nodes.find((n) => n.id === id)
    if (node) sorted.push(node)

    for (const neighbor of adjList.get(id) || []) {
      const newDeg = (inDegree.get(neighbor) || 0) - 1
      inDegree.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }

  return sorted
}

// ─── Get upstream node outputs ────────────────────────────────────────────────
function getUpstreamNodes(nodeId: string, nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const upstreamIds = edges
    .filter((e) => e.target === nodeId)
    .map((e) => e.source)
  return nodes.filter((n) => upstreamIds.includes(n.id))
}

// ─── Validate Workflow ────────────────────────────────────────────────────────
export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const errors: string[] = []

  if (nodes.length === 0) {
    errors.push('Workflow is empty. Add some nodes to get started.')
    return errors
  }

  // Check for at least one idea node
  const hasIdea = nodes.some((n) => n.type === 'idea')
  if (!hasIdea) {
    errors.push('Workflow needs at least one Idea node as a starting point.')
  }

  // Check idea nodes have content
  for (const node of nodes) {
    if (node.type === 'idea') {
      const data = node.data as IdeaNodeData
      if (!data.idea?.trim()) {
        errors.push(`Idea node "${data.label}" has no creative idea entered.`)
      }
    }
  }

  // Check M3 nodes have upstream connections
  for (const node of nodes) {
    if (node.type === 'm3Director') {
      const upstream = getUpstreamNodes(node.id, nodes, edges)
      if (upstream.length === 0) {
        errors.push('M3 Creative Director needs an upstream connection (e.g., from an Idea node).')
      }
    }
  }

  // Check H3 nodes need a prompt source
  for (const node of nodes) {
    if (node.type === 'h3Video') {
      const data = node.data as H3VideoNodeData
      const upstream = getUpstreamNodes(node.id, nodes, edges)
      if (upstream.length === 0 && !data.prompt?.trim()) {
        errors.push('H3 Video node needs either a prompt or an upstream M3 connection.')
      }
    }
  }

  return errors
}

// ─── Execute a Single Node ────────────────────────────────────────────────────
async function executeNode(
  node: WorkflowNode,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  store: ReturnType<typeof useWorkflowStore.getState>
): Promise<void> {
  const { updateNodeData, updateNodeStatus, addLog, setEdgeAnimated, edges: currentEdges } = store

  const log = (message: string, level: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    addLog({ nodeId: node.id, nodeType: node.type, message, level })
  }

  const upstream = getUpstreamNodes(node.id, nodes, edges)

  // Animate outgoing edges
  const outgoingEdges = currentEdges.filter((e) => e.source === node.id)
  for (const edge of outgoingEdges) {
    setEdgeAnimated(edge.id, true)
  }

  try {
    switch (node.type) {
      // ── Idea Node: just mark as complete ──────────────────────────────────
      case 'idea': {
        const data = node.data as IdeaNodeData
        if (!data.idea?.trim()) {
          throw new Error('Idea is empty')
        }
        updateNodeStatus(node.id, 'complete')
        log(`✓ Idea captured: "${data.idea.slice(0, 60)}..."`, 'success')
        break
      }

      // ── M3 Creative Director ──────────────────────────────────────────────
      case 'm3Director': {
        updateNodeStatus(node.id, 'running')
        updateNodeData(node.id, { processingMessage: 'M3 is directing your scene...' })
        log('M3 Creative Director is reasoning about your idea...', 'info')

        // Get idea from upstream
        let ideaText = ''
        let genre = ''
        let mood = ''

        for (const upNode of upstream) {
          if (upNode.type === 'idea') {
            const d = upNode.data as IdeaNodeData
            ideaText = d.idea
            genre = d.genre
            mood = d.mood
          }
        }

        if (!ideaText) throw new Error('No idea connected to M3 node')

        const result = await callM3Director({ idea: ideaText, genre, mood })

        updateNodeData(node.id, {
          blueprint: result.blueprint,
          error: null,
          processingMessage: '',
        })
        updateNodeStatus(node.id, 'complete')
        log(`✓ M3 generated cinematic blueprint: "${result.blueprint?.title}"`, 'success')
        break
      }

      // ── M2.7 Workflow Assistant ───────────────────────────────────────────
      case 'm27Assistant': {
        updateNodeStatus(node.id, 'running')
        log('M2.7 is analyzing the workflow...', 'info')

        const nodeData = node.data as M27AssistantNodeData

        // Build context from upstream nodes
        const context: Record<string, unknown> = {}
        for (const upNode of upstream) {
          if (upNode.type === 'idea') {
            const d = upNode.data as IdeaNodeData
            context.idea = d.idea
            context.genre = d.genre
            context.mood = d.mood
          }
          if (upNode.type === 'm3Director') {
            const d = upNode.data as M3DirectorNodeData
            context.blueprint = d.blueprint
          }
        }

        const task = nodeData.task || 'Analyze and validate this cinematic workflow. Suggest improvements and identify any issues.'

        const result = await callM27Assistant({ task, context })

        updateNodeData(node.id, { result: result.result, error: null })
        updateNodeStatus(node.id, 'complete')
        log(`✓ M2.7 workflow analysis complete`, 'success')
        break
      }

      // ── H3 Video ──────────────────────────────────────────────────────────
      case 'h3Video': {
        updateNodeStatus(node.id, 'queued')
        updateNodeData(node.id, { processingMessage: 'Submitting to H3 for cinematic generation...' })
        log('H3 Video: Preparing cinematic prompt...', 'info')

        const videoData = node.data as H3VideoNodeData

        // Get prompt from M3 upstream or direct prompt
        let prompt = videoData.prompt
        for (const upNode of upstream) {
          if (upNode.type === 'm3Director') {
            const d = upNode.data as M3DirectorNodeData
            if (d.blueprint?.h3_primary_prompt) {
              prompt = d.blueprint.h3_primary_prompt
              updateNodeData(node.id, { prompt })
            }
          }
        }

        if (!prompt?.trim()) {
          throw new Error('H3 Video node requires a cinematic prompt. Connect an M3 node or enter a prompt manually.')
        }

        const submitResult = await submitH3Video({
          prompt,
          resolution: videoData.resolution || '2K',
          duration: videoData.duration || 5,
          ratio: videoData.ratio || '16:9',
        })

        updateNodeData(node.id, {
          requestId: submitResult.request_id,
          processingMessage: 'H3 is generating cinematic footage...',
        })
        updateNodeStatus(node.id, 'processing')
        log(`H3 job submitted (ID: ${submitResult.request_id})`, 'info')

        // Poll for completion
        const final = await pollUntilComplete(
          submitResult.request_id,
          (status) => {
            updateNodeData(node.id, { processingMessage: `H3 ${status}...` })
            log(`H3 status: ${status}`, 'info')
          },
          4000,
          90
        )

        const videoUrl = final.outcome?.video_url || null
        const thumbnailUrl = final.outcome?.thumbnail_image_url || null

        updateNodeData(node.id, {
          videoUrl,
          thumbnailUrl,
          error: null,
          processingMessage: '',
        })
        updateNodeStatus(node.id, 'complete')
        log('✓ H3 cinematic footage generated', 'success')
        break
      }

      // ── Speech 2.8 ────────────────────────────────────────────────────────
      case 'speech28': {
        updateNodeStatus(node.id, 'queued')
        updateNodeData(node.id, { processingMessage: 'Preparing narration...' })
        log('Speech 2.8: Preparing voice generation...', 'info')

        const speechData = node.data as Speech28NodeData

        // Get narration text from M3 blueprint
        let text = speechData.text
        let emotion = speechData.emotion || 'auto'

        for (const upNode of upstream) {
          if (upNode.type === 'm3Director') {
            const d = upNode.data as M3DirectorNodeData
            if (d.blueprint?.narration?.text && !text.trim()) {
              text = d.blueprint.narration.text
              emotion = d.blueprint.narration.emotion || emotion
              updateNodeData(node.id, { text, emotion })
            }
          }
        }

        // Validate emotion - only allow known values to prevent API errors
        if (!EMOTION_OPTIONS.includes(emotion as typeof EMOTION_OPTIONS[number])) {
          emotion = 'auto'
          updateNodeData(node.id, { emotion })
        }

        if (!text?.trim()) {
          throw new Error('Speech 2.8 node requires narration text. Connect an M3 node or enter text manually.')
        }

        const submitResult = await submitSpeech({
          text,
          voice_id: speechData.voiceId || 'English_expressive_narrator',
          emotion,
          speed: speechData.speed || 1,
        })

        updateNodeData(node.id, {
          requestId: submitResult.request_id,
          processingMessage: 'Speech 2.8 is generating narration...',
        })
        updateNodeStatus(node.id, 'processing')
        log(`Speech job submitted (ID: ${submitResult.request_id})`, 'info')

        const final = await pollUntilComplete(
          submitResult.request_id,
          (status) => {
            updateNodeData(node.id, { processingMessage: `Speech ${status}...` })
          },
          3000,
          60
        )

        const audioUrl = final.outcome?.media_urls?.[0]?.url || null

        updateNodeData(node.id, {
          audioUrl,
          error: null,
          processingMessage: '',
        })
        updateNodeStatus(node.id, 'complete')
        log('✓ Narration generated', 'success')
        break
      }

      // ── Music 3.0 ─────────────────────────────────────────────────────────
      case 'music30': {
        updateNodeStatus(node.id, 'queued')
        updateNodeData(node.id, { processingMessage: 'Composing cinematic score...' })
        log('Music 3.0: Preparing music brief...', 'info')

        const musicData = node.data as Music30NodeData

        let lyrics = musicData.lyrics
        let prompt = musicData.prompt

        // Get music brief from ANY upstream intelligence node (M3 or M2.7)
        for (const upNode of upstream) {
          if (upNode.type === 'm3Director') {
            const d = upNode.data as M3DirectorNodeData
            if (d.blueprint?.music_brief) {
              const brief = d.blueprint.music_brief
              if (!lyrics.trim()) {
                lyrics = `[Intro]\n(${brief.opening})\n\n[Verse]\n${brief.middle}\n\n[Chorus]\n${brief.climax}\n\n[Outro]\n(${brief.ending})`
              }
              if (!prompt.trim()) {
                prompt = brief.prompt || brief.style || ''
              }
              updateNodeData(node.id, { lyrics, prompt })
            }
          }
          if (upNode.type === 'm27Assistant') {
            const d = upNode.data as M27AssistantNodeData
            if (d.result?.optimized_prompt && !prompt.trim()) {
              prompt = d.result.optimized_prompt
              updateNodeData(node.id, { prompt })
            }
          }
          // Also accept direct idea node upstream as fallback
          if (upNode.type === 'idea') {
            const d = upNode.data as IdeaNodeData
            if (!lyrics.trim() && d.idea) {
              lyrics = `[Intro]\n(Atmospheric opening)\n\n[Verse]\n${d.idea}\n\n[Chorus]\nThe story unfolds\n\n[Outro]\n(Fade to silence)`
              if (!prompt.trim()) {
                prompt = `${d.genre || 'Cinematic'} score, ${d.mood || 'dramatic'}, emotional orchestral`
              }
              updateNodeData(node.id, { lyrics, prompt })
            }
          }
        }

        // Use fallback generic lyrics if still empty
        if (!lyrics.trim()) {
          lyrics = `[Intro]\n(Cinematic atmospheric opening)\n\n[Verse]\nA journey begins in silence\nThe world holds its breath\n\n[Chorus]\nRising through the darkness\nInto the light\n\n[Outro]\n(Gentle fade)`
          prompt = prompt.trim() || 'Cinematic orchestral score, emotional, atmospheric'
          updateNodeData(node.id, { lyrics, prompt })
          log('Music: using fallback lyrics (no M3 blueprint found)', 'warning')
        }

        const submitResult = await submitMusic({ lyrics, prompt })

        // Check if already complete (sync response)
        if (submitResult.status === 'success' && submitResult.outcome) {
          const audioUrl = submitResult.outcome?.audio_url ||
            submitResult.outcome?.media_urls?.[0]?.url || null
          updateNodeData(node.id, {
            requestId: submitResult.request_id,
            audioUrl,
            error: null,
            processingMessage: '',
          })
          updateNodeStatus(node.id, 'complete')
          log('✓ Cinematic score generated', 'success')
          break
        }

        updateNodeData(node.id, {
          requestId: submitResult.request_id,
          processingMessage: 'Music 3.0 is composing your score...',
        })
        updateNodeStatus(node.id, 'processing')

        const final = await pollUntilComplete(
          submitResult.request_id,
          (status) => {
            updateNodeData(node.id, { processingMessage: `Music ${status}...` })
          },
          4000,
          60,
          import.meta.env.VITE_MUSIC_API_URL || undefined
        )

        const audioUrl = final.outcome?.audio_url || final.outcome?.media_urls?.[0]?.url || null

        updateNodeData(node.id, {
          audioUrl,
          error: null,
          processingMessage: '',
        })
        updateNodeStatus(node.id, 'complete')
        log('✓ Cinematic score generated', 'success')
        break
      }

      // ── Final Output ──────────────────────────────────────────────────────
      case 'finalOutput': {
        updateNodeStatus(node.id, 'running')
        log('Assembling cinematic project...', 'info')

        let videoUrl: string | null = null
        let audioUrl: string | null = null
        let musicUrl: string | null = null
        let blueprint: CinematicBlueprint | null = null
        let title = 'Cinematic Project'

        for (const upNode of upstream) {
          if (upNode.type === 'h3Video') {
            const d = upNode.data as H3VideoNodeData
            videoUrl = d.videoUrl
          }
          if (upNode.type === 'speech28') {
            const d = upNode.data as Speech28NodeData
            audioUrl = d.audioUrl
          }
          if (upNode.type === 'music30') {
            const d = upNode.data as Music30NodeData
            musicUrl = d.audioUrl
          }
          if (upNode.type === 'm3Director') {
            const d = upNode.data as M3DirectorNodeData
            blueprint = d.blueprint
            title = d.blueprint?.title || title
          }
        }

        updateNodeData(node.id, { videoUrl, audioUrl, musicUrl, blueprint, title })
        updateNodeStatus(node.id, 'complete')
        log(`✓ Cinematic project assembled: "${title}"`, 'success')
        break
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    updateNodeData(node.id, { error: message } as Partial<WorkflowNode['data']>)
    updateNodeStatus(node.id, 'error')
    log(`✗ Error in ${node.type}: ${message}`, 'error')
    throw err
  } finally {
    // Stop edge animation
    for (const edge of outgoingEdges) {
      setEdgeAnimated(edge.id, false)
    }
  }
}

// ─── Main Workflow Executor ───────────────────────────────────────────────────
export async function executeWorkflow(): Promise<void> {
  const store = useWorkflowStore.getState()
  const { nodes, edges, setWorkflowStatus, clearLog, updateNodeStatus } = store

  // Always reset status first so previous error/complete never blocks
  setWorkflowStatus('idle')
  clearLog()

  // Validate
  const errors = validateWorkflow(nodes, edges)
  if (errors.length > 0) {
    setWorkflowStatus('error')
    for (const err of errors) {
      store.addLog({ nodeId: '', nodeType: 'idea', message: `⚠ ${err}`, level: 'error' })
    }
    return
  }

  // Reset all node states to idle
  for (const node of nodes) {
    updateNodeStatus(node.id, 'idle')
    // Clear previous errors
    useWorkflowStore.getState().updateNodeData(node.id, { error: null } as Partial<typeof node.data>)
  }

  setWorkflowStatus('running')
  store.addLog({ nodeId: '', nodeType: 'idea', message: '▶ Workflow execution started', level: 'info' })

  // Topological sort — use fresh state
  const freshState = useWorkflowStore.getState()
  const sortedNodes = topologicalSort(freshState.nodes, freshState.edges)

  // Execute in order
  for (const node of sortedNodes) {
    const s = useWorkflowStore.getState()
    try {
      await executeNode(node, s.nodes, s.edges, useWorkflowStore.getState())
    } catch {
      setWorkflowStatus('error')
      useWorkflowStore.getState().addLog({
        nodeId: '',
        nodeType: 'idea',
        message: '✗ Workflow execution failed',
        level: 'error',
      })
      return
    }
  }

  setWorkflowStatus('complete')
  useWorkflowStore.getState().addLog({
    nodeId: '',
    nodeType: 'finalOutput',
    message: '✓ Workflow complete — cinematic project ready',
    level: 'success',
  })
}
