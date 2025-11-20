import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskCategory, TaskStatus } from '@vettech/data';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ type: 'text', default: TaskCategory.WORK })
  category!: TaskCategory;

  @ManyToOne(() => Organization, { eager: true, onDelete: 'CASCADE' })
  organization!: Organization;

  @ManyToOne(() => User, (user) => user.tasks, { eager: true, onDelete: 'SET NULL' })
  owner!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
