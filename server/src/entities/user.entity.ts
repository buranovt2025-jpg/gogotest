import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

export enum UserRole {
  BUYER = 'BUYER',
  SELLER_FULL = 'SELLER_FULL',
  SELLER_SIMPLE = 'SELLER_SIMPLE',
  COURIER = 'COURIER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  email!: string

  @Column()
  passwordHash!: string

  @Column({ type: 'varchar', length: 30 })
  role!: UserRole

  @CreateDateColumn()
  createdAt!: Date
}
