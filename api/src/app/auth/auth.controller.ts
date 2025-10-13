import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: any) {
    const { username, password } = body ?? {};
    if (!username || !password) {
      return { ok: false, error: 'Missing credentials' };
    }
    return { ok: true, accessToken: 'dev-token', user: { email: username } };
  }
}
