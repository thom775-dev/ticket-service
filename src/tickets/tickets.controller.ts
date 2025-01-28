import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { JwtGuard } from '../auth/guard'
import { GetUser } from '../auth/decorator'
import { CreateTicketDto } from './dto'

@Controller('tickets')
export class TicketsController {
  constructor(private ticketService: TicketsService) {}

  @Get()
  getTickets() {
    return this.ticketService.getTickets()
  }

  @UseGuards(JwtGuard)
  @Post()
  createTicket(
    @GetUser('id') userId: number,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.ticketService.createTicket(userId, createTicketDto)
  }
}
