import { Role } from '../enums/role.enum';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskCategory {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  organizationId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: TaskStatus;
  category?: TaskCategory;
  organizationId: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
}

export interface UserRoleAssignmentDto {
  organizationId: string;
  role: Role;
}

export interface JwtPayloadDto {
  sub: string;
  username: string;
  organizationId: string;
  roles: Role[];
}
