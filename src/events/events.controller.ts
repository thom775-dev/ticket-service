import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { EventsService } from './events.service'
import { JwtGuard } from '../auth/guard'
import { GetUser } from '../auth/decorator'
import { CreateEventDto, UpdateEventDto } from './dto'

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('all')
  getAllEvents() {
    return this.eventsService.getAllEvents()
  }

  @Get('search')
  searchEvents(@Query('key') key: string) {
    return this.eventsService.searchEvent(key)
  }

  @UseGuards(JwtGuard)
  @Get()
  getEvents(@GetUser('id') userId: number) {
    return this.eventsService.getEvents(userId)
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  getEventById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventId: number,
  ) {
    return this.eventsService.getEventById(userId, eventId)
  }

  @UseGuards(JwtGuard)
  @Post()
  createEvent(
    @GetUser('id') userId: number,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.createEvent(userId, createEventDto)
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  updateEventById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventId: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.updateEventById(userId, eventId, updateEventDto)
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteEventById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) eventId: number,
  ) {
    return this.eventsService.deleteEventById(userId, eventId)
  }
}
