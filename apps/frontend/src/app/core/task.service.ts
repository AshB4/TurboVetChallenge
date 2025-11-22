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

  list(): Observable<TaskDto[]> {
  
    const mockTasks: TaskDto[] = [
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
    return of(mockTasks);
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
    return this.http.put<TaskDto>(`/api/tasks/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${id}`);
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
