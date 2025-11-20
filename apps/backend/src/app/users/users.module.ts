import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization, RoleEntity, User, UserOrganizationRole } from '../entities';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization, RoleEntity, UserOrganizationRole])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
