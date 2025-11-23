import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import {
  Organization,
  Permission,
  RoleEntity,
  Task,
  User,
  UserOrganizationRole,
} from './entities';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RbacGuard } from '@vettech/auth';
import { ensureRolesTableHasId } from './database/ensure-roles-table';

const entities = [
  User,
  Organization,
  Task,
  RoleEntity,
  Permission,
  UserOrganizationRole,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        try {
          const dbType = (process.env.DB_TYPE ?? 'sqlite').toLowerCase();

          if (dbType === 'postgres') {
            return {
              type: 'postgres' as const,
              url: process.env.DB_URL,
              entities,
              synchronize: process.env.NODE_ENV !== 'production',
            };
          }

          const databasePath =
            process.env.DB_URL || join(process.cwd(), 'apps/backend/dev.db');
          const type =
            dbType === 'better-sqlite3' ? 'better-sqlite3' : 'sqlite';

          if (type === 'sqlite' || type === 'better-sqlite3') {
            await ensureRolesTableHasId(databasePath);
          }

          return {
            type,
            database: databasePath,
            entities,
            synchronize: process.env.NODE_ENV !== 'production',
          };
        } catch (error) {
          console.error('Database configuration error:', error);
          throw error;
        }
      },
    }),
    AuditModule,
    AuthModule,
    UsersModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
  ],
})
export class AppModule {}
