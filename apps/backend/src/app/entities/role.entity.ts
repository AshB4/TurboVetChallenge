// apps/api/src/app/entities/role.entity.ts   (preferred location)
// Adjust import path to your monorepo alias
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ColumnOptions,
} from 'typeorm';
import { Permission as PermissionEntity } from './permission.entity';
import { Role as RoleEnum } from '@vettech/data'; // <- your enum: OWNER | ADMIN | VIEWER

const isPostgres = (process.env.DB_TYPE ?? '').toLowerCase() === 'postgres';

const roleNameColumnOptions: ColumnOptions = isPostgres
  ? {
      type: 'enum',
      enum: RoleEnum,
      enumName: 'role_name_enum',
      unique: true,
    }
  : {
      type: 'text',
      unique: true,
    };

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // SQLite (used for local development) does not support the native enum
  // column type. Persist the enum as plain text so the same entity works for
  // both SQLite and Postgres without custom migrations.
  @Column(roleNameColumnOptions)
  name!: RoleEnum;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToMany(() => PermissionEntity, { cascade: true })
  @JoinTable()
  permissions!: PermissionEntity[];
}
