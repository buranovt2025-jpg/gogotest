import { Controller, Get, Header } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { MetricsService } from './metrics.service'

const version = process.env.npm_package_version ?? '1.0.0'

function escapeLabel(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

@Controller('metrics')
@SkipThrottle()
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  get(): string {
    const total = this.metrics.getHttpRequestsTotal()
    const byRoute = this.metrics.getRequestCountByRoute()
    const lines = [
      '# HELP gogomarket_info Application info.',
      '# TYPE gogomarket_info gauge',
      `gogomarket_info{version="${version}"} 1`,
      '',
      '# HELP gogomarket_uptime_seconds Process uptime in seconds.',
      '# TYPE gogomarket_uptime_seconds gauge',
      `gogomarket_uptime_seconds ${Math.floor(process.uptime())}`,
      '',
      '# HELP gogomarket_http_requests_total Total HTTP requests (excluding /health, /metrics).',
      '# TYPE gogomarket_http_requests_total counter',
      `gogomarket_http_requests_total ${total}`,
    ]
    if (byRoute.length > 0) {
      lines.push('', '# HELP gogomarket_http_requests_by_route Requests by method and path (normalized).', '# TYPE gogomarket_http_requests_by_route counter')
      for (const { method, path, count } of byRoute) {
        lines.push(`gogomarket_http_requests_by_route{method="${escapeLabel(method)}",path="${escapeLabel(path)}"} ${count}`)
      }
    }
    return lines.join('\n')
  }
}
