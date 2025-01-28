import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { PurchasesService } from './purchases.service'
import { CreatePurchaseDto } from './dto'
import { JwtGuard } from '../auth/guard'
import { GetUser } from '../auth/decorator'

@UseGuards(JwtGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Get()
  getPurchaseHistory(@GetUser('id') userId: number) {
    return this.purchasesService.getPurchaseHistory(userId)
  }

  @Post()
  purchaseTicket(
    @GetUser('id') userId: number,
    @Body() createPurchaseDto: CreatePurchaseDto,
  ) {
    return this.purchasesService.purchaseTicket(userId, createPurchaseDto)
  }
}
