// api/src/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type RoleName = 'OWNER' | 'ADMIN' | 'VIEWER';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: RoleName;
}
