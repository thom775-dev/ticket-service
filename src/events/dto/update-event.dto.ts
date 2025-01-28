import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description: string

  @IsOptional()
  @IsDateString()
  dateTime: string

  @IsOptional()
  @IsString()
  venue: string

  @IsOptional()
  @IsInt()
  availableTickets: number
}
