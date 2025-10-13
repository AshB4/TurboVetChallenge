import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { HealthController } from './health.controller';

function toSeconds(v: string | number, fallback = 3600): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v !== 'string') return fallback;

  // supports "5000s", "30m", "2h", "1d", or plain "3600"
  const m = v.trim().match(/^(\d+)\s*([smhd])?$/i);
  if (!m) return fallback;
  const n = parseInt(m[1], 10);
  const unit = (m[2] || 's').toLowerCase();
  const mult =
    unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return n * mult;
}

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const raw = config.get<string | number>('JWT_EXPIRES_IN', 3600);
        return {
          secret: config.get<string>('JWT_SECRET', 'local-dev-secret'),
          signOptions: {
            expiresIn: toSeconds(raw), // <-- number (seconds)
          },
        };
      },
    }),
  ],
  controllers: [AuthController, HealthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
