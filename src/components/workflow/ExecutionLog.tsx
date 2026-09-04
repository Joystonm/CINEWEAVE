import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { useWorkflowStore } from '../../store/workflowStore'

const ICON = {
  info: <Info size={10} className="text-blue-400" />,
  success: <CheckCircle size={10} className="text-emerald-400" />,
  error: <XCircle size={10} className="text-red-400" />,
  warning: <AlertTriangle size={10} className="text-amber-400" />,
}

const LABEL_COLOR = {
  info: 'text-white/60',
  success: 'text-emerald-300',
  error: 'text-red-300',
  warning: 'text-amber-300',
}

export function ExecutionLog() {
  const log = useWorkflowStore((s) => s.executionLog)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  if (log.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-white/20 italic">
        Execution log will appear here...
      </div>
    )
  }

  return (
    <div className="overflow-y-auto max-h-full">
      <AnimatePresence>
        {log.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 px-4 py-1.5 hover:bg-white/2 group"
          >
            <span className="flex-shrink-0 mt-0.5">{ICON[entry.level]}</span>
            <span className={`text-[11px] leading-relaxed ${LABEL_COLOR[entry.level]}`}>
              {entry.message}
            </span>
            <span className="text-[9px] text-white/15 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}
