import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User, UserRole } from '../entities/user.entity'

const SEED_EMAIL = 'admin@gogomarket.local'
const SEED_PASSWORD = 'GogoAdmin123'

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.repo.count()
    if (count === 0) {
      await this.create(SEED_EMAIL, SEED_PASSWORD, UserRole.ADMIN)
      console.log(`Seed user created: ${SEED_EMAIL} / ${SEED_PASSWORD}`)
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email: email.toLowerCase() } })
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } })
  }

  async create(email: string, password: string, role: UserRole): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10)
    const user = this.repo.create({
      email: email.toLowerCase(),
      passwordHash,
      role,
    })
    return this.repo.save(user)
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash)
  }

  async findByRole(role: UserRole): Promise<{ id: string; email: string }[]> {
    const list = await this.repo.find({ where: { role }, select: ['id', 'email'] })
    return list.map((u) => ({ id: u.id, email: u.email }))
  }
}
