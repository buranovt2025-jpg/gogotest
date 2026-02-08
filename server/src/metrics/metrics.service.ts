import { Injectable } from '@nestjs/common'

const UUID_RE = /^[0-9a-f-]{36}$/i
const NUMERIC_RE = /^\d+$/

function normalizePath(path: string): string {
  if (!path || path === '/') return path
  return path
    .split('?')[0]
    .split('/')
    .map((seg) => {
      if (!seg) return seg
      if (UUID_RE.test(seg) || NUMERIC_RE.test(seg)) return ':id'
      return seg
    })
    .join('/')
}

@Injectable()
export class MetricsService {
  private httpRequestsTotal = 0
  private byRoute = new Map<string, number>()

  incRequest(method: string, path: string): void {
    this.httpRequestsTotal += 1
    const norm = normalizePath(path)
    const key = `${method} ${norm}`
    this.byRoute.set(key, (this.byRoute.get(key) ?? 0) + 1)
  }

  getHttpRequestsTotal(): number {
    return this.httpRequestsTotal
  }

  getRequestCountByRoute(): Array<{ method: string; path: string; count: number }> {
    const out: Array<{ method: string; path: string; count: number }> = []
    for (const [key, count] of this.byRoute) {
      const [method, path] = key.split(' ', 2)
      out.push({ method, path: path ?? '', count })
    }
    return out.sort((a, b) => (a.path + a.method).localeCompare(b.path + b.method))
  }
}
