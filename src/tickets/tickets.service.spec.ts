import { Test, TestingModule } from '@nestjs/testing'
import { TicketsService } from './tickets.service'
import { PrismaService } from '../prisma/prisma.service'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { CreateTicketDto } from './dto'

describe('TicketsService', () => {
  let service: TicketsService
  let mockPrisma: any

  beforeEach(async () => {
    mockPrisma = {
      ticket: {
        findMany: jest.fn(),
        create: jest.fn(),
        aggregate: jest.fn(),
      },
      event: {
        findUnique: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<TicketsService>(TicketsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getTickets', () => {
    it('should return a list of tickets with events', async () => {
      const mockTickets = [
        { id: 1, eventId: 1, category: 'VIP', availableQuantity: 10 },
      ]
      mockPrisma.ticket.findMany.mockResolvedValue(mockTickets)

      const result = await service.getTickets()
      expect(result).toEqual(mockTickets)
      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        include: { event: true },
      })
    })
  })

  describe('createTicket', () => {
    it('should create and return a new ticket', async () => {
      const createTicketDto: CreateTicketDto = {
        eventId: 1,
        category: 'VIP',
        price: 100,
        availableQuantity: 50,
      }

      const mockEvent = { id: 1, userId: 1, availableTickets: 100 }
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent)

      mockPrisma.ticket.aggregate.mockResolvedValue({
        _sum: { availableQuantity: 50 },
      })

      const mockTicket = { id: 1, ...createTicketDto }
      mockPrisma.ticket.create.mockResolvedValue(mockTicket)

      const result = await service.createTicket(1, createTicketDto)
      expect(result).toEqual(mockTicket)
      expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
        data: {
          eventId: 1,
          category: 'VIP',
          price: 100,
          availableQuantity: 50,
        },
      })
    })

    it('should throw NotFoundException if event does not exist', async () => {
      const createTicketDto: CreateTicketDto = {
        eventId: 1,
        category: 'VIP',
        price: 100,
        availableQuantity: 50,
      }

      mockPrisma.event.findUnique.mockResolvedValue(null)

      await expect(service.createTicket(1, createTicketDto)).rejects.toThrow(
        new NotFoundException('Event does not exist'),
      )
    })

    it('should throw ForbiddenException if available tickets exceed event capacity', async () => {
      const createTicketDto: CreateTicketDto = {
        eventId: 1,
        category: 'VIP',
        price: 100,
        availableQuantity: 60,
      }

      const mockEvent = { id: 1, userId: 1, availableTickets: 100 }
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent)

      mockPrisma.ticket.aggregate.mockResolvedValue({
        _sum: { availableQuantity: 50 },
      })

      await expect(service.createTicket(1, createTicketDto)).rejects.toThrow(
        new ForbiddenException('Exceeds total available tickets for the event'),
      )
    })
  })
})
