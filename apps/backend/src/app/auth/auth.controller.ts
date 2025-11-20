import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '@vettech/data';
import { Public } from '@vettech/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }
}
