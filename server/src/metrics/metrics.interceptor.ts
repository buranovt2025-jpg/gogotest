import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { MetricsService } from './metrics.service'

const SKIP_PATHS = ['/health', '/metrics']

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ method?: string; path?: string }>()
    const path = req?.path ?? ''
    if (!SKIP_PATHS.some((p) => path === p || path.startsWith(p + '?'))) {
      const method = (req?.method ?? 'GET').toUpperCase()
      this.metrics.incRequest(method, path)
    }
    return next.handle().pipe(tap())
  }
}
