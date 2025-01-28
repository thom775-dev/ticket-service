import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateTicketDto } from './dto'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTickets() {
    return this.prisma.ticket.findMany()
  }

  async createTicket(
    userId: number,
    eventId: number,
    createTicketDto: CreateTicketDto,
  ) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
        userId: userId,
      },
    })

    if (!event) {
      throw new NotFoundException('Event does not exist')
    }

    const totalTickets = await this.prisma.ticket.aggregate({
      where: { eventId },
      _sum: { availableQuantity: true },
    })

    const totalAvailableTickets: number =
      totalTickets._sum.availableQuantity || 0

    if (
      totalAvailableTickets + createTicketDto.availableQuantity >
      event.availableTickets
    ) {
      throw new ForbiddenException(
        'Exceeds total available tickets for the event',
      )
    }

    return this.prisma.ticket.create({
      data: {
        eventId,
        category: createTicketDto.category,
        price: createTicketDto.price,
        availableQuantity: createTicketDto.availableQuantity,
      },
    })
  }
}
