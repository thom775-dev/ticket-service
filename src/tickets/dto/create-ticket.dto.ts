import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator'

export class CreateTicketDto {
  @IsNotEmpty()
  @IsNumber()
  eventId: number

  @IsNotEmpty()
  @IsString()
  category: string

  @IsNumber()
  @Min(0)
  price: number

  @IsNumber()
  @Min(1)
  availableQuantity: number
}
