import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '@vettech/data';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret ?? 'local-dev-secret',
    });
  }

  async validate(payload: JwtPayloadDto): Promise<JwtPayloadDto> {
    if (!payload?.sub || !payload.username || !payload.organizationId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    if (!Array.isArray(payload.roles) || payload.roles.length === 0) {
      throw new UnauthorizedException('Token is missing role assignments');
    }
    return payload;
  }
}
