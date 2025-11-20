import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { UserOrganizationRole } from './user-organization-role.entity';
import { Task } from './task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  displayName!: string;

  @Column()
  passwordHash!: string;

  @ManyToOne(() => Organization, { eager: true })
  organization!: Organization;

  @OneToMany(() => UserOrganizationRole, (assignment) => assignment.user, {
    cascade: true,
  })
  roleAssignments!: UserOrganizationRole[];

  @OneToMany(() => Task, (task) => task.owner)
  tasks!: Task[];
}
