import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  CreateTaskDto,
  TaskCategory,
  TaskDto,
  TaskStatus,
  UpdateTaskDto,
} from '@vettech/data';
import { TaskService } from './task.service';

type TaskBuckets = Record<TaskStatus, TaskDto[]>;

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly api = inject(TaskService);

  readonly tasks = signal<TaskDto[]>([]);
  readonly categoryFilter = signal<TaskCategory | 'ALL'>('ALL');
  readonly sortDescending = signal(true);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalCount = computed(() => this.tasks().length);
  readonly doneCount = computed(
    () => this.tasks().filter((task) => task.status === TaskStatus.DONE).length,
  );
  readonly completionRate = computed(() => {
    const total = this.totalCount();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.doneCount() / total) * 100);
  });

  readonly filteredTasks = computed(() => {
    const filter = this.categoryFilter();
    const sortDesc = this.sortDescending();
    const tasks = this.tasks();
    const filtered =
      filter === 'ALL' ? tasks : tasks.filter((task) => task.category === filter);
    return [...filtered].sort((a, b) => {
      const aDate = new Date(a.updatedAt).getTime();
      const bDate = new Date(b.updatedAt).getTime();
      return sortDesc ? bDate - aDate : aDate - bDate;
    });
  });

  readonly groupedByStatus = computed<TaskBuckets>(() => {
    const buckets: TaskBuckets = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
    };

    for (const task of this.filteredTasks()) {
      buckets[task.status] = [...buckets[task.status], task];
    }

    return buckets;
  });

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (tasks) => this.tasks.set(tasks),
        error: () => this.error.set('Unable to load tasks.'),
      });
  }

  create(payload: CreateTaskDto): Observable<TaskDto> {
    return this.api.create(payload).pipe(
      tap((task) => this.tasks.set([task, ...this.tasks()])),
    );
  }

  update(id: string, payload: UpdateTaskDto): Observable<TaskDto> {
    return this.api.update(id, payload).pipe(
      tap((updated) =>
        this.tasks.set(
          this.tasks().map((task) => (task.id === updated.id ? updated : task)),
        ),
      ),
    );
  }

  updateStatus(id: string, status: TaskStatus): Observable<TaskDto> {
    return this.update(id, { status });
  }

  remove(id: string): Observable<void> {
    return this.api.remove(id).pipe(
      tap(() => this.tasks.set(this.tasks().filter((task) => task.id !== id))),
    );
  }

  setCategoryFilter(filter: TaskCategory | 'ALL'): void {
    this.categoryFilter.set(filter);
  }

  toggleSort(): void {
    this.sortDescending.update((value) => !value);
  }

  tasksFor(status: TaskStatus): TaskDto[] {
    return this.groupedByStatus()[status];
  }

  taskById(id: string): TaskDto | undefined {
    return this.tasks().find((task) => task.id === id);
  }

  upsert(task: TaskDto): void {
    const exists = this.taskById(task.id);
    if (exists) {
      this.tasks.set(
        this.tasks().map((item) => (item.id === task.id ? task : item)),
      );
      return;
    }
    this.tasks.set([task, ...this.tasks()]);
  }

  setError(message: string | null): void {
    this.error.set(message);
  }
}
