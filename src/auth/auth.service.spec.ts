import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon from 'argon2'
import { ForbiddenException } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

describe('AuthService', () => {
  let service: AuthService
  let mockPrisma: any
  let mockJwtService: any
  let mockConfigService: any

  beforeEach(async () => {
    mockPrisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    }

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
    }

    mockConfigService = {
      get: jest.fn().mockReturnValue('mock-secret'),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('register', () => {
    const mockRegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    }

    it('should throw an error if name, email or password is empty', async () => {
      await expect(
        service.register({ name: '', email: '', password: '' }),
      ).rejects.toThrow()
    })

    it('should register a user and return a token', async () => {
      jest.spyOn(argon, 'hash').mockResolvedValue('hashed-password')

      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email: mockRegisterDto.email,
      })

      const result = await service.register(mockRegisterDto)

      expect(result).toEqual({ access_token: 'mocked-jwt-token' })
      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: 1, email: mockRegisterDto.email },
        { expiresIn: '30m', secret: 'mock-secret' },
      )
    })

    it('should throw ForbiddenException if email already exists', async () => {
      mockPrisma.user.create.mockRejectedValue(
        new PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '6.2.1',
        }),
      )

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        ForbiddenException,
      )
    })
  })

  describe('login', () => {
    const mockLoginDto = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should throw an error if email or password is missing', async () => {
      await expect(service.login({ email: '', password: '' })).rejects.toThrow()
    })

    it('should login a user and return a token', async () => {
      jest.spyOn(argon, 'verify').mockResolvedValue(true)

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: mockLoginDto.email,
        hash: 'hashed-password',
      })

      const result = await service.login(mockLoginDto)

      expect(result).toEqual({ access_token: 'mocked-jwt-token' })
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginDto.email },
      })
    })

    it('should throw ForbiddenException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw ForbiddenException if password is incorrect', async () => {
      jest.spyOn(argon, 'verify').mockResolvedValue(false)

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: mockLoginDto.email,
        hash: 'hashed-password',
      })

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        ForbiddenException,
      )
    })
  })

  describe('signToken', () => {
    it('should throw an error if token signing fails', async () => {
      mockJwtService.signAsync.mockRejectedValue(new Error('Token error'))

      await expect(service.signToken(1, 'test@example.com')).rejects.toThrow(
        'Token error',
      )
    })

    it('should return a signed token', async () => {
      const result = await service.signToken(1, 'test@example.com')

      expect(result).toEqual({ access_token: 'mocked-jwt-token' })
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: 1, email: 'test@example.com' },
        { expiresIn: '30m', secret: 'mock-secret' },
      )
    })
  })
})
