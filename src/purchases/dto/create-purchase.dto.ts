import { IsNotEmpty, IsNumber } from 'class-validator'

export class CreatePurchaseDto {
  @IsNotEmpty()
  @IsNumber()
  ticketId: number

  @IsNotEmpty()
  @IsNumber()
  quantity: number
}
