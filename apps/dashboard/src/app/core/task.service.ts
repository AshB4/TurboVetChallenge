import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from '@vettech/data';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  list(): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>('/api/tasks');
  }

  create(payload: CreateTaskDto): Observable<TaskDto> {
    return this.http.post<TaskDto>('/api/tasks', payload);
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
