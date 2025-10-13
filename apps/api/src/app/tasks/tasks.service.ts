import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateTaskDto,
  JwtPayloadDto,
  TaskCategory,
  TaskDto,
  TaskStatus,
  UpdateTaskDto,
  Role,
} from '@vettech/data';
import { Task } from '../entities';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasksRepository: Repository<Task>,
    private readonly usersService: UsersService,
  ) {}

  async createTask(input: CreateTaskDto, user: JwtPayloadDto): Promise<TaskDto> {
    if (input.organizationId !== user.organizationId) {
      throw new ForbiddenException('Cannot create tasks for another organization');
    }
    const owner = await this.usersService.findByUsername(user.username);
    if (!owner) {
      throw new NotFoundException('User not found');
    }
    if (owner.organization.id !== user.organizationId) {
      throw new ForbiddenException('User organization mismatch');
    }
    const entity = this.tasksRepository.create({
      title: input.title,
      description: input.description,
      status: input.status ?? TaskStatus.TODO,
      category: input.category ?? TaskCategory.WORK,
      organization: owner.organization,
      owner,
    });
    const saved = await this.tasksRepository.save(entity);
    return this.toDto(saved);
  }

  async findAllForUser(user: JwtPayloadDto): Promise<TaskDto[]> {
    const tasks = await this.tasksRepository.find({
      where: { organization: { id: user.organizationId } },
      relations: ['organization', 'owner'],
      order: { createdAt: 'DESC' },
    });
    return tasks.map((task) => this.toDto(task));
  }

  async updateTask(id: string, input: UpdateTaskDto, user: JwtPayloadDto): Promise<TaskDto> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['organization', 'owner'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    this.ensureTaskAccess(task, user, input);
    Object.assign(task, input);
    const saved = await this.tasksRepository.save(task);
    return this.toDto(saved);
  }

  async removeTask(id: string, user: JwtPayloadDto): Promise<void> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['organization', 'owner'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    this.ensureTaskAccess(task, user);
    await this.tasksRepository.remove(task);
  }

  private ensureTaskAccess(task: Task, user: JwtPayloadDto, input?: UpdateTaskDto) {
    if (task.organization.id !== user.organizationId) {
      throw new ForbiddenException('Task belongs to another organization');
    }
    const hasRole = user.roles.some((role) => role === Role.OWNER || role === Role.ADMIN);
    const isOwner = task.owner?.username === user.username;
    if (!hasRole && !isOwner) {
      throw new ForbiddenException('Insufficient role for task mutation');
    }
    if (input?.status && !Object.values(TaskStatus).includes(input.status)) {
      throw new ForbiddenException('Invalid task status');
    }
    if (input?.category && !Object.values(TaskCategory).includes(input.category)) {
      throw new ForbiddenException('Invalid task category');
    }
  }

  private toDto(task: Task): TaskDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      category: task.category,
      organizationId: task.organization.id,
      ownerId: task.owner?.id ?? '',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
