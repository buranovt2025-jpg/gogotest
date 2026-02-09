import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, toast.duration ?? 3000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const bgColor = {
    success: '#dcfce7',
    error: '#fee2e2',
    info: '#dbeafe',
    warning: '#fef3c7',
  }[toast.type]

  const textColor = {
    success: '#166534',
    error: '#991b1b',
    info: '#1e40af',
    warning: '#92400e',
  }[toast.type]

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[toast.type]

  return (
    <div
      style={{
        background: bgColor,
        color: textColor,
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        minWidth: '250px',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: textColor,
          cursor: 'pointer',
          fontSize: '1.2rem',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Закрыть"
      >
        ×
      </button>
    </div>
  )
}
