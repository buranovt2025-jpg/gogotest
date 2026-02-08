import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { ProductsModule } from './products/products.module'
import { OrdersModule } from './orders/orders.module'
import { MediaModule } from './media/media.module'
import { HealthController } from './health/health.controller'
import { MetricsModule } from './metrics/metrics.module'
import { MetricsInterceptor } from './metrics/metrics.interceptor'
import { ChatGateway } from './chat/chat.gateway'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: 'api', ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    MediaModule,
    MetricsModule,
  ],
  controllers: [HealthController],
  providers: [
    ChatGateway,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
})
export class AppModule {}
