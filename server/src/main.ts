import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { join } from 'node:path'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const port = process.env.PORT ?? 3001
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.enableCors({ origin: true })
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' })
  await app.listen(port)
  console.log(`GogoMarket API http://localhost:${port}`)
}
bootstrap()
