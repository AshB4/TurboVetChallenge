import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role, TaskCategory, TaskStatus } from '@vettech/data';
import { Task } from '../entities';
import { TasksService } from './tasks.service';

const mockTask = (): Task => ({
  id: 'task-1',
  title: 'Task',
  description: 'Desc',
  status: TaskStatus.TODO,
  category: TaskCategory.WORK,
  organization: { id: 'org-1' } as any,
  owner: { id: 'user-1', username: 'owner' } as any,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
});

describe('TasksService', () => {
  let repository: jest.Mocked<Repository<Task>>;
  let usersService: { findByUsername: jest.Mock };
  let service: TasksService;

  beforeEach(() => {
    repository = {
      create: jest.fn((value) => value as any),
      save: jest.fn(async (value) => value as any),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Task>>;
    usersService = { findByUsername: jest.fn() };
    service = new TasksService(repository, usersService as any);
  });

  it('returns tasks scoped to the user organization', async () => {
    const task = mockTask();
    repository.find.mockResolvedValue([task]);
    const result = await service.findAllForUser({
      sub: '123',
      username: 'owner',
      organizationId: 'org-1',
      roles: [Role.ADMIN],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(task.id);
  });

  it('prevents creating tasks for another organization', async () => {
    usersService.findByUsername.mockResolvedValue({
      organization: { id: 'org-2' },
    });
    await expect(
      service.createTask(
        {
          title: 'X',
          description: 'Y',
          organizationId: 'org-1',
        },
        { sub: '1', username: 'user', organizationId: 'org-1', roles: [Role.ADMIN] },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows owners to update tasks in their org', async () => {
    const task = mockTask();
    repository.findOne.mockResolvedValue(task);
    const result = await service.updateTask(
      'task-1',
      { status: TaskStatus.IN_PROGRESS },
      { sub: '1', username: 'owner', organizationId: 'org-1', roles: [Role.OWNER] },
    );
    expect(result.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('blocks viewers from deleting tasks they do not own', async () => {
    const task = mockTask();
    task.owner = { username: 'different' } as any;
    repository.findOne.mockResolvedValue(task);
    await expect(
      service.removeTask(
        'task-1',
        { sub: '1', username: 'viewer', organizationId: 'org-1', roles: [Role.VIEWER] },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('prevents admins from updating tasks that belong to another organization', async () => {
    const task = mockTask();
    task.organization = { id: 'org-2' } as any;
    repository.findOne.mockResolvedValue(task);
    await expect(
      service.updateTask(
        'task-1',
        { title: 'Updated title' },
        { sub: '1', username: 'admin', organizationId: 'org-1', roles: [Role.ADMIN] },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws when task does not exist during update', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(
      service.updateTask(
        'missing',
        {},
        { sub: '1', username: 'owner', organizationId: 'org-1', roles: [Role.OWNER] },
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates a task when the user has rights', async () => {
    usersService.findByUsername.mockResolvedValue({
      username: 'owner',
      organization: { id: 'org-1' },
    });
    repository.save.mockResolvedValue({
      ...mockTask(),
      title: 'New',
    });
    const result = await service.createTask(
      {
        title: 'New',
        description: 'Task',
        organizationId: 'org-1',
      },
      { sub: '1', username: 'owner', organizationId: 'org-1', roles: [Role.ADMIN] },
    );
    expect(result.title).toBe('New');
  });

  it('rejects updates with invalid status transitions', async () => {
    const task = mockTask();
    repository.findOne.mockResolvedValue(task);
    await expect(
      service.updateTask(
        'task-1',
        { status: 'NOT_A_STATUS' as TaskStatus },
        { sub: '1', username: 'owner', organizationId: 'org-1', roles: [Role.OWNER] },
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
