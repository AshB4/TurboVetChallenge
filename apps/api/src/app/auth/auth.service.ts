import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto, JwtPayloadDto } from '@vettech/data';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(username: string, password: string): Promise<AuthResponseDto> {
    const user = await this.validateUser(username, password);
    const payload = await this.usersService.buildJwtPayload(user.id);
    return { accessToken: await this.signJwt(payload) };
  }

  async signJwt(payload: JwtPayloadDto): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
