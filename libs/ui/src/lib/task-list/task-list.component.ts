import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { TaskCardComponent, TaskCardData } from '../task-card/task-card.component';

@Component({
  selector: 'tvfe-task-list',
  standalone: true,
  imports: [NgForOf, NgIf, TaskCardComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent {
  @Input()
  title?: string;

  @Input()
  emptyMessage = 'No tasks to show yet.';

  @Input()
  tasks: TaskCardData[] = [];

  trackByTask(index: number, task: TaskCardData): string | number {
    return task.id ?? index;
  }
}
