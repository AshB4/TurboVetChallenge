import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Role } from '@vettech/data';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('user_organization_roles')
@Unique(['user', 'organization', 'role'])
export class UserOrganizationRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.roleAssignments, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization!: Organization;

  @Column({ type: 'simple-enum', enum: Role })
  role!: Role;
}
