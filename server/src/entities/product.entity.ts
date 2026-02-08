import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column('decimal', { precision: 12, scale: 2 })
  price!: number

  @Column('text', { default: '' })
  description!: string

  @Column({ length: 20, default: 'FULL' })
  sellerType!: string

  @Column({ type: 'varchar', length: 512, nullable: true })
  imageUrl!: string | null

  @Column({ type: 'varchar', length: 512, nullable: true })
  videoUrl!: string | null
}
