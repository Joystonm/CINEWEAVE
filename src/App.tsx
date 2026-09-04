import { AnimatePresence, motion } from 'framer-motion'
import { ReactFlowProvider } from '@xyflow/react'
import { useWorkflowStore } from './store/workflowStore'
import { LandingPage } from './pages/LandingPage'
import { Sidebar } from './components/layout/Sidebar'
import { Toolbar } from './components/layout/Toolbar'
import { LogDrawer } from './components/layout/LogDrawer'
import { WorkflowCanvas } from './components/workflow/WorkflowCanvas'
import { InspectorPanel } from './components/workflow/InspectorPanel'
import { LineagePanel } from './components/workflow/LineagePanel'

function WorkspaceApp() {
  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--cw-bg-base)' }}>
        <Sidebar />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <Toolbar />
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <WorkflowCanvas />
            <InspectorPanel />
          </div>
          <LogDrawer />
        </div>
        <LineagePanel />
      </div>
    </ReactFlowProvider>
  )
}

export default function App() {
  const showLanding = useWorkflowStore((s) => s.showLanding)

  return (
    <AnimatePresence mode="wait">
      {showLanding ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          style={{ height: '100vh', width: '100vw' }}
        >
          <LandingPage />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ height: '100vh', width: '100vw' }}
        >
          <WorkspaceApp />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
