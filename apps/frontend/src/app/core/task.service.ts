import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CreateTaskDto,
  TaskDto,
  UpdateTaskDto,
  TaskStatus,
  TaskCategory,
} from '@vettech/data';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  private mockTasks: TaskDto[] = [
    {
      id: '1',
      title: 'Update vaccination reminders',
      description: 'Review and update the reminder schedule for Q4.',
      status: TaskStatus.IN_PROGRESS,
      category: TaskCategory.WORK,
      organizationId: '1',
      ownerId: '1',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Schedule team offsite',
      description: 'Coordinate venue and agenda for the annual offsite.',
      status: TaskStatus.TODO,
      category: TaskCategory.WORK,
      organizationId: '1',
      ownerId: '1',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
  ];

  list(): Observable<TaskDto[]> {
    return of(this.mockTasks);
  }

  create(payload: CreateTaskDto): Observable<TaskDto> {
    const mockTask: TaskDto = {
      id: Math.random().toString(),
      title: payload.title,
      description: payload.description,
      status: TaskStatus.TODO,
      category: payload.category || TaskCategory.WORK,
      organizationId: '1',
      ownerId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return of(mockTask);
  }

  update(id: string, payload: UpdateTaskDto): Observable<TaskDto> {
    const task = this.mockTasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');
    const updated: TaskDto = {
      ...task,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    const index = this.mockTasks.findIndex((t) => t.id === id);
    this.mockTasks[index] = updated;
    return of(updated);
  }

  remove(id: string): Observable<void> {
    const index = this.mockTasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Task not found');
    this.mockTasks.splice(index, 1);
    return of(void 0);
  }

  get(id: string): Observable<TaskDto> {
    return this.http.get<TaskDto[]>(`/api/tasks`).pipe(
      map((tasks: TaskDto[]) => {
        const task = tasks.find(
          (item: TaskDto) => String(item.id) === String(id)
        );
        if (!task) throw new Error('Task not found');
        return task;
      })
    );
  }
}
