import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description: string

  @IsDateString()
  dateTime: string

  @IsNotEmpty()
  @IsString()
  venue: string

  @IsNotEmpty()
  @IsInt()
  availableTickets: number
}
