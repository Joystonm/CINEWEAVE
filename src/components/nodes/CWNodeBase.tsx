import { memo, type ReactNode } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeStatus } from '../../types'
import { NodeStatusBadge } from '../ui/NodeStatusBadge'

interface CWNodeProps {
  title: string
  subtitle: string
  icon: ReactNode
  accentColor: string
  glowColor: string
  status: NodeStatus
  processingMessage?: string
  children?: ReactNode
  hasInput?: boolean
  hasOutput?: boolean
  selected?: boolean
  multipleOutputs?: boolean
}

const handleBase: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: '2px solid rgba(139,92,246,0.6)',
  background: '#1e1e36',
  cursor: 'crosshair',
}

export const CWNodeBase = memo(function CWNodeBase({
  title,
  subtitle,
  icon,
  accentColor,
  glowColor,
  status,
  processingMessage,
  children,
  hasInput = true,
  hasOutput = true,
  selected = false,
  multipleOutputs = false,
}: CWNodeProps) {
  const isActive = status === 'running' || status === 'processing' || status === 'queued'

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 12,
        minWidth: 220,
        maxWidth: 260,
        background: 'linear-gradient(135deg, #1e1e36 0%, #151528 100%)',
        border: `1px solid ${selected ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isActive
          ? `0 0 24px -4px ${glowColor}`
          : selected
          ? '0 0 16px -4px rgba(139,92,246,0.4)'
          : '0 4px 24px -4px rgba(0,0,0,0.5)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Accent top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '12px 12px 0 0',
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 14px 8px' }}>
        <div style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${accentColor}22`, border: `1px solid ${accentColor}44`,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>

      {/* Status */}
      <div style={{ padding: '0 14px 8px' }}>
        <NodeStatusBadge status={status} processingMessage={processingMessage} />
      </div>

      {/* Content */}
      {children && (
        <div style={{ padding: '0 14px 14px' }}>
          {children}
        </div>
      )}

      {/* INPUT handle */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ ...handleBase, left: -7 }}
        />
      )}

      {/* OUTPUT handle(s) */}
      {hasOutput && !multipleOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ ...handleBase, right: -7 }}
        />
      )}
      {multipleOutputs && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="output-a"
            style={{ ...handleBase, right: -7, top: '35%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="output-b"
            style={{ ...handleBase, right: -7, top: '65%' }}
          />
        </>
      )}
    </div>
  )
})
