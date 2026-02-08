import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserRole } from '../entities/user.entity'
import { UsersService } from '../users/users.service'

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  role: UserRole
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string; user: { id: string; email: string; role: string } }> {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user) throw new UnauthorizedException('Неверный email или пароль')
    const ok = await this.usersService.validatePassword(user, dto.password)
    if (!ok) throw new UnauthorizedException('Неверный email или пароль')
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role }
    const access_token = this.jwtService.sign(payload)
    return {
      access_token,
      user: { id: user.id, email: user.email, role: user.role },
    }
  }

  async register(dto: RegisterDto): Promise<{ access_token: string; user: { id: string; email: string; role: string } }> {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) throw new UnauthorizedException('Пользователь с таким email уже существует')
    const user = await this.usersService.create(dto.email, dto.password, dto.role)
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role }
    const access_token = this.jwtService.sign(payload)
    return {
      access_token,
      user: { id: user.id, email: user.email, role: user.role },
    }
  }

  async validateByPayload(payload: JwtPayload): Promise<{ id: string; email: string; role: UserRole } | null> {
    const user = await this.usersService.findById(payload.sub)
    if (!user) return null
    return { id: user.id, email: user.email, role: user.role }
  }
}
