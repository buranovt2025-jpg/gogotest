import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('order_tracks')
export class OrderTrack {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid' })
  orderId!: string

  @Column('decimal', { precision: 10, scale: 7 })
  lat!: number

  @Column('decimal', { precision: 10, scale: 7 })
  lng!: number

  @Column('timestamptz')
  createdAt!: Date
}
