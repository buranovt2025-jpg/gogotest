import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { Product } from '../entities/product.entity'
import { Order } from '../entities/order.entity'
import { OrderTrack } from '../entities/order-track.entity'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL')
        
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, Product, Order, OrderTrack],
            synchronize: true,
            logging: config.get('NODE_ENV') === 'development',
          }
        }
        
        // Fallback на отдельные переменные окружения
        const host = config.get<string>('DB_HOST') || 'localhost'
        const port = config.get<number>('DB_PORT') || 5432
        const username = config.get<string>('DB_USERNAME') || 'postgres'
        const password = config.get<string>('DB_PASSWORD') || ''
        const database = config.get<string>('DB_NAME') || 'gogomarket'
        
        return {
          type: 'postgres',
          host,
          port,
          username,
          password: String(password), // Убеждаемся, что пароль - строка
          database,
          entities: [User, Product, Order, OrderTrack],
          synchronize: true,
          logging: config.get('NODE_ENV') === 'development',
        }
      },
    }),
  ],
})
export class DatabaseModule {}
