import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn() id: number;

  @Column() title: string;

  @Column({ default: false }) completed: boolean;

  @ManyToOne(() => Organization, (org) => org.tasks, { eager: true })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.tasks, { eager: true }) owner: User;
}
