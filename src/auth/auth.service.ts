import { ForbiddenException, Injectable } from '@nestjs/common'
import { LoginDto, RegisterDto } from './dto'
import * as argon from 'argon2'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const hash = await argon.hash(registerDto.password)

    try {
      const user = await this.prisma.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          hash: hash,
        },
      })

      return this.signToken(user.id, user.email)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists')
        }
      }

      throw error
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    })

    if (!user) throw new ForbiddenException('Incorrect email or password')

    // Check Password
    const isCorrectPassword = await argon.verify(user.hash, loginDto.password)

    if (!isCorrectPassword)
      throw new ForbiddenException('Incorrect email or password')

    return this.signToken(user.id, user.email)
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{
    access_token: string
  }> {
    const payload = {
      sub: userId,
      email,
    }

    const secret = this.config.get('JWT_SECRET')
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret,
    })

    return {
      access_token: token,
    }
  }
}
