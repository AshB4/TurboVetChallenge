import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Task } from './task.entity';

export type RoleName = 'OWNER' | 'ADMIN' | 'VIEWER';

@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number;

  @Column({ unique: true }) username: string;

  @Column() password: string;

  @Column({ default: 'VIEWER' }) role: RoleName;

  @ManyToOne(() => Organization, (org) => org.users, { eager: true })
  organization: Organization;

  @OneToMany(() => Task, (task) => task.owner) tasks: Task[];
}
