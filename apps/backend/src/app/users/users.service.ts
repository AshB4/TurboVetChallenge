import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayloadDto, Role } from '@vettech/data';
import { User } from '../entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['roleAssignments', 'roleAssignments.organization', 'organization'],
    });
  }

  async buildJwtPayload(userId: string): Promise<JwtPayloadDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roleAssignments', 'roleAssignments.organization', 'organization'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const roles = this.getRolesForOrg(user);
    return {
      sub: user.id,
      username: user.username,
      organizationId: user.organization.id,
      roles,
    };
  }

  getRolesForOrg(user: User): Role[] {
    const orgId = user.organization.id;
    return user.roleAssignments
      .filter((assignment) => assignment.organization.id === orgId)
      .map((assignment) => assignment.role);
  }

  async assertSameOrganization(userId: string, organizationId: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });
    if (!user || user.organization.id !== organizationId) {
      throw new NotFoundException('Organization mismatch');
    }
  }
}
