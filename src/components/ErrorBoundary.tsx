import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="layout-main" style={{ padding: '2rem' }}>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Что-то пошло не так</h2>
            <p>Обновите страницу или вернитесь на главную.</p>
            <a href="/" className="btn btn-primary">На главную</a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
