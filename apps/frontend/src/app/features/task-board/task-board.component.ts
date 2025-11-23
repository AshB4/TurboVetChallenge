import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  CdkDrag,
  CdkDropList,
  DragDropModule,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';
import {
  CreateTaskDto,
  Role,
  TaskCategory,
  TaskDto,
  TaskStatus,
} from '@vettech/data';
import { AuthService } from '../../core/auth.service';
import { TaskStore } from '../../core/task.store';
import { ThemeService } from '../../core/theme.service';

interface ColumnConfig {
  status: TaskStatus;
  title: string;
  description: string;
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    CdkDrag,
    CdkDropList,
  ],
  templateUrl: './task-board.component.html',
})
export class TaskBoardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  protected readonly store = inject(TaskStore);
  protected readonly theme = inject(ThemeService);

  readonly statuses: ColumnConfig[] = [
    { status: TaskStatus.TODO, title: 'To do', description: 'Queued items' },
    {
      status: TaskStatus.IN_PROGRESS,
      title: 'In progress',
      description: 'Active work',
    },
    {
      status: TaskStatus.DONE,
      title: 'Completed',
      description: 'Shipped or resolved',
    },
  ];

  readonly categories = Object.values(TaskCategory);
  readonly canMutate = computed(
    () => this.auth.hasRole(Role.ADMIN) || this.auth.hasRole(Role.OWNER)
  );

  readonly createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    category: [TaskCategory.WORK as TaskCategory],
  });

  ngOnInit(): void {
    this.store.load();
  }

  tasksFor(status: TaskStatus) {
    return this.store.tasksFor(status);
  }

  createTask() {
    if (!this.canMutate()) {
      return;
    }
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const user = this.auth.currentUser;
    if (!user) {
      return;
    }
    const payload: CreateTaskDto = {
      ...this.createForm.getRawValue(),
      organizationId: user.organizationId,
    } as CreateTaskDto;
    this.store.setError(null);
    this.store.create(payload).subscribe({
      next: () => {
        this.createForm.reset({
          title: '',
          description: '',
          category: TaskCategory.WORK,
        });
      },
      error: () => this.store.setError('Unable to create task.'),
    });
  }

  drop(event: CdkDragDrop<TaskDto[]>, targetStatus: TaskStatus) {
    const task = event.item.data as TaskDto;
    if (task.status === targetStatus) {
      return;
    }
    this.store.setError(null);
    this.store.updateStatus(task.id, targetStatus).subscribe({
      error: () => this.store.setError('Unable to update task.'),
    });
  }

  deleteTask(task: TaskDto) {
    if (!this.canMutate()) {
      return;
    }
    this.store.setError(null);
    this.store.remove(task.id).subscribe({
      error: () => this.store.setError('Unable to delete task.'),
    });
  }

  toggleSort() {
    this.store.toggleSort();
  }

  setCategoryFilter(filter: TaskCategory | 'ALL') {
    this.store.setCategoryFilter(filter);
  }
}
