import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { CardComponent } from '../card/card.component';

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface TaskCardData {
  id?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | Date;
  assignee?: string;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Standby',
  'in-progress': 'Mission Active',
  'in-review': 'Debriefing',
  done: 'Mission Accomplished',
};

@Component({
  selector: 'tvfe-task-card',
  standalone: true,
  imports: [CardComponent, DatePipe, NgClass, NgIf],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  @Input()
  task: TaskCardData = {
    title: '',
  };

  get statusLabel(): string {
    const status = this.task.status ?? 'todo';
    return STATUS_LABEL[status];
  }
}
