import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null

  @Column({ type: 'date' })
  date!: string

  @Column('decimal', { precision: 12, scale: 2 })
  total!: number

  @Column({ length: 50 })
  status!: string

  @Column({ type: 'uuid', nullable: true })
  assignedToCourierId!: string | null

  @Column('text')
  items!: string

  @Column({ length: 30, nullable: true })
  disputeStatus!: string | null

  @Column({ length: 50, nullable: true })
  disputeReason!: string | null

  @Column('text', { nullable: true })
  disputeComment!: string | null

  @Column('timestamptz', { nullable: true })
  disputeOpenedAt!: Date | null

  @Column({ length: 30, nullable: true })
  disputeResolution!: string | null

  @Column({ length: 100, nullable: true })
  disputeResolvedBy!: string | null

  @Column('timestamptz', { nullable: true })
  disputeResolvedAt!: Date | null

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lastCourierLat!: number | null

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  lastCourierLng!: number | null

  @Column('timestamptz', { nullable: true })
  lastCourierAt!: Date | null
}
