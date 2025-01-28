import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEventDto, UpdateEventDto } from './dto'

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllEvents() {
    return this.prisma.event.findMany({
      include: {
        tickets: {
          select: {
            category: true,
            price: true,
            availableQuantity: true,
            soldQuantity: true,
          },
        },
      },
    })
  }

  async searchEvent(key: string) {
    return this.prisma.event.findMany({
      where: {
        OR: [
          { name: { contains: key, mode: 'insensitive' } },
          { venue: { contains: key, mode: 'insensitive' } },
        ],
      },
      include: {
        tickets: {
          select: {
            category: true,
            price: true,
            availableQuantity: true,
            soldQuantity: true,
          },
        },
      },
    })
  }

  async getEvents(userId: number) {
    return this.prisma.event.findMany({
      where: {
        userId,
      },
      include: {
        tickets: {
          select: {
            category: true,
            price: true,
            availableQuantity: true,
            soldQuantity: true,
          },
        },
      },
    })
  }

  async getEventById(userId: number, eventId: number) {
    return this.prisma.event.findUnique({
      where: {
        userId,
        id: eventId,
      },
      include: {
        tickets: {
          select: {
            category: true,
            price: true,
            availableQuantity: true,
            soldQuantity: true,
          },
        },
      },
    })
  }

  async createEvent(userId: number, createEventDto: CreateEventDto) {
    try {
      return this.prisma.event.create({
        data: {
          userId,
          name: createEventDto.name,
          description: createEventDto.description,
          dateTime: new Date(createEventDto.dateTime),
          venue: createEventDto.venue,
          availableTickets: createEventDto.availableTickets,
        },
      })
    } catch (error) {
      throw new Error('Error while creating event')
    }
  }

  async updateEventById(
    userId: number,
    eventId: number,
    updateEventDto: UpdateEventDto,
  ) {
    const event = await this.prisma.event.findUnique({
      where: {
        userId,
        id: eventId,
      },
    })

    if (!event) throw new NotFoundException('Event does not exist')

    return this.prisma.event.update({
      where: {
        id: event.id,
      },
      data: {
        ...updateEventDto,
      },
    })
  }

  async deleteEventById(userId: number, eventId: number) {
    const event = await this.prisma.event.findUnique({
      where: {
        userId,
        id: eventId,
      },
    })

    if (!event) throw new NotFoundException('Event does not exist')

    return this.prisma.event.delete({
      where: {
        id: event.id,
      },
    })
  }
}
