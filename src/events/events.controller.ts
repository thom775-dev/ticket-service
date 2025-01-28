import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { EventsService } from './events.service'
import { JwtGuard } from '../auth/guard'
import { CreateEventDto } from './dto/create-event.dto'
import { GetUser } from '../auth/decorator'

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEvents() {
    return this.eventsService.getEvents()
  }

  @UseGuards(JwtGuard)
  @Post()
  createEvent(
    @GetUser('id') userId: number,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.createEvent(userId, createEventDto)
  }
}
