import { Controller, Get } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'

@Controller('health')
@SkipThrottle()
export class HealthController {
  @Get()
  get() {
    return {
      ok: true,
      service: 'gogomarket-api',
      version: process.env.npm_package_version ?? '1.0.0',
      ts: new Date().toISOString(),
    }
  }
}
