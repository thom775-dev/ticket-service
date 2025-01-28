import { Injectable } from '@nestjs/common'
import { CreateEventDto } from './dto/create-event.dto'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}
  async getEvents() {
    return 'events'
  }

  async createEvent(userId: number, createEventDto: CreateEventDto) {
    try {
      const event = await this.prisma.event.create({
        data: {
          userId,
          name: createEventDto.name,
          description: createEventDto.description,
          dateTime: new Date(createEventDto.dateTime),
          venue: createEventDto.venue,
          availableTickets: createEventDto.availableTickets,
        },
      })

      return event
    } catch (error) {
      throw new Error('Error while creating event')
    }
  }
}
