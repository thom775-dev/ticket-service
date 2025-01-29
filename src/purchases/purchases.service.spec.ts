import { Test, TestingModule } from '@nestjs/testing'
import { PurchasesService } from './purchases.service'
import { PrismaService } from '../prisma/prisma.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { CreatePurchaseDto } from './dto'

describe('PurchasesService', () => {
  let service: PurchasesService
  let mockPrisma: any

  beforeEach(async () => {
    mockPrisma = {
      purchase: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      ticket: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      event: {
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<PurchasesService>(PurchasesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getPurchaseHistory', () => {
    it('should return purchase history with ticket details', async () => {
      const mockPurchases = [
        {
          id: 1,
          ticket: {
            category: 'VIP',
            price: 100,
            event: {
              name: 'Concert',
              availableTickets: 50,
            },
          },
        },
      ]
      mockPrisma.purchase.findMany.mockResolvedValue(mockPurchases)

      const result = await service.getPurchaseHistory(1)
      expect(result).toEqual(mockPurchases)
      expect(mockPrisma.purchase.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          ticket: {
            select: {
              category: true,
              price: true,
              event: {
                select: {
                  name: true,
                  availableTickets: true,
                },
              },
            },
          },
        },
      })
    })
  })

  describe('purchaseTicket', () => {
    it('should successfully purchase a ticket', async () => {
      const createPurchaseDto: CreatePurchaseDto = {
        ticketId: 1,
        quantity: 2,
      }

      const mockTicket = {
        id: 1,
        availableQuantity: 10,
        soldQuantity: 0,
        eventId: 1,
        event: {
          availableTickets: 100,
        },
      }

      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket)
      mockPrisma.$transaction.mockResolvedValue({
        id: 1,
        userId: 1,
        ticketId: 1,
        quantity: 2,
      })

      const result = await service.purchaseTicket(1, createPurchaseDto)
      expect(result).toEqual({
        id: 1,
        userId: 1,
        ticketId: 1,
        quantity: 2,
      })

      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should throw NotFoundException if ticket not found', async () => {
      const createPurchaseDto: CreatePurchaseDto = {
        ticketId: 1,
        quantity: 2,
      }

      mockPrisma.ticket.findUnique.mockResolvedValue(null)

      await expect(
        service.purchaseTicket(1, createPurchaseDto),
      ).rejects.toThrow(new NotFoundException('Ticket not found'))
    })

    it('should throw ForbiddenException if not enough tickets available', async () => {
      const createPurchaseDto: CreatePurchaseDto = {
        ticketId: 1,
        quantity: 10,
      }

      const mockTicket = {
        id: 1,
        availableQuantity: 5,
        soldQuantity: 0,
        eventId: 1,
        event: {
          availableTickets: 50,
        },
      }

      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket)

      await expect(
        service.purchaseTicket(1, createPurchaseDto),
      ).rejects.toThrow(new ForbiddenException('Not enough tickets available'))
    })

    it('should update ticket and event after a successful purchase', async () => {
      const createPurchaseDto: CreatePurchaseDto = {
        ticketId: 1,
        quantity: 2,
      }

      const mockTicket = {
        id: 1,
        availableQuantity: 10,
        soldQuantity: 0,
        eventId: 1,
        event: {
          availableTickets: 100,
        },
      }

      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket)

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma)
      })

      await service.purchaseTicket(1, createPurchaseDto)

      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          availableQuantity: 8,
          soldQuantity: 2,
        },
      })

      expect(mockPrisma.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          availableTickets: 98,
        },
      })
    })
  })
})
