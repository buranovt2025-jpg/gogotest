import Toast, { type Toast as ToastType } from './Toast'

export default function ToastContainer({ toasts, onRemove }: { toasts: ToastType[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '1rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast toast={toast} onClose={onRemove} />
        </div>
      ))}
    </div>
  )
}
