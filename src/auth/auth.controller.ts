import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto, RegisterDto } from './dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ access_token: string }> {
    return this.authService.register(registerDto)
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }
}
