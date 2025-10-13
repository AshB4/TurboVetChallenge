import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../app/entities/user.entity';
import { Organization } from '../app/entities/organization.entity';
import { Task } from '../app/entities/task.entity';
import { Role } from '../app/entities/role.entity';
import { Permission } from '../app/entities/permission.entity';
import { AuthController } from '../app/auth/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as any) || 'better-sqlite3',
      database: process.env.DB_URL || 'dev.db',
      entities: [User, Organization, Task, Role, Permission],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Organization, Task, Role, Permission]),
  ],
  controllers: [AuthController], // ✅ add this
})
export class AppModule {}
