import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskCategory, TaskStatus } from '@vettech/data';
import { TaskService } from '../../core/task.service';
import { TaskStore } from '../../core/task.store';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-detail.component.html',
})
export class TaskDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tasks = inject(TaskService);
  private readonly store = inject(TaskStore);

  readonly categories = Object.values(TaskCategory);
  readonly statuses = Object.values(TaskStatus);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly taskId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    category: [TaskCategory.WORK],
    status: [TaskStatus.TODO],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/tasks']);
      return;
    }
    this.taskId.set(id);
    this.tasks.get(id).subscribe({
      next: (task) => {
        this.store.upsert(task);
        this.form.patchValue({
          title: task.title,
          description: task.description,
          category: task.category,
          status: task.status,
        });
      },
      error: () => {
        this.error.set('Task not found');
      },
    });
  }

  save() {
    const id = this.taskId();
    if (!id || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.store.update(id, this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/tasks']);
      },
      error: () => {
        this.error.set('Unable to update task');
        this.saving.set(false);
      },
    });
  }
}
