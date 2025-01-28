import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePurchaseDto } from './dto'

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}
  async getPurchaseHistory(userId: number) {
    return this.prisma.purchase.findMany({
      where: {
        userId,
      },
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
  }

  async purchaseTicket(userId: number, createPurchaseDto: CreatePurchaseDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: createPurchaseDto.ticketId },
      include: { event: true },
    })

    if (!ticket) {
      throw new NotFoundException('Ticket not found')
    }

    if (ticket.availableQuantity < createPurchaseDto.quantity) {
      throw new ForbiddenException('Not enough tickets available')
    }

    const purchase = await this.prisma.$transaction(async (prisma) => {
      // Update tickets table
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          availableQuantity:
            ticket.availableQuantity - createPurchaseDto.quantity,
          soldQuantity: ticket.soldQuantity + createPurchaseDto.quantity,
        },
      })

      // Update events table
      await prisma.event.update({
        where: { id: ticket.eventId },
        data: {
          availableTickets:
            ticket.event.availableTickets - createPurchaseDto.quantity,
        },
      })

      // Create a purchase record
      const newPurchase = await prisma.purchase.create({
        data: {
          userId,
          ticketId: ticket.id,
          quantity: createPurchaseDto.quantity,
        },
      })

      return newPurchase
    })

    return purchase
  }
}
