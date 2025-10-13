import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { TaskBoardComponent } from './task-board.component';
import { AuthService } from '../../core/auth.service';
import { TaskStore } from '../../core/task.store';
import { Role, TaskCategory, TaskDto, TaskStatus } from '@vettech/data';

class TaskStoreStub {
  tasks = signal<TaskDto[]>([]);
  categoryFilter = signal<TaskCategory | 'ALL'>('ALL');
  sortDescending = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  readonly filteredTasks = computed(() => {
    const filter = this.categoryFilter();
    const sortDesc = this.sortDescending();
    const source = this.tasks();
    const items = filter === 'ALL' ? source : source.filter((task) => task.category === filter);
    return [...items].sort((a, b) => {
      const aDate = new Date(a.updatedAt).getTime();
      const bDate = new Date(b.updatedAt).getTime();
      return sortDesc ? bDate - aDate : aDate - bDate;
    });
  });

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

  load: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  updateStatus: jest.Mock;
  remove: jest.Mock;
  setCategoryFilter: jest.Mock;
  toggleSort: jest.Mock;
  setError: jest.Mock;

  constructor() {
    this.load = jest.fn();
    this.create = jest.fn().mockReturnValue(of<TaskDto>({} as TaskDto));
    this.update = jest.fn().mockReturnValue(of<TaskDto>({} as TaskDto));
    this.updateStatus = jest.fn().mockReturnValue(of<TaskDto>({} as TaskDto));
    this.remove = jest.fn().mockReturnValue(of(void 0));
    this.setCategoryFilter = jest.fn().mockImplementation((filter: TaskCategory | 'ALL') => {
      this.categoryFilter.set(filter);
    });
    this.toggleSort = jest.fn().mockImplementation(() => this.sortDescending.set(!this.sortDescending()));
    this.setError = jest.fn();
  }

  tasksFor(status: TaskStatus): TaskDto[] {
    return this.filteredTasks().filter((task) => task.status === status);
  }
}

describe('TaskBoardComponent', () => {
  let fixture: ComponentFixture<TaskBoardComponent>;
  let component: TaskBoardComponent;
  let store: TaskStoreStub;
  let auth: Partial<AuthService>;

  const demoTask: TaskDto = {
    id: '1',
    title: 'Review charts',
    description: 'Check the latest lab results',
    status: TaskStatus.TODO,
    category: TaskCategory.WORK,
    organizationId: 'org-1',
    ownerId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    store = new TaskStoreStub();
    store.tasks.set([demoTask]);
    store.create.mockReturnValue(of(demoTask));
    store.updateStatus.mockReturnValue(of(demoTask));

    auth = {
      currentUser: { organizationId: 'org-1', roles: [Role.ADMIN], sub: 'user-1', username: 'owner', token: 'token' },
      hasRole: () => true,
      logout: () => {},
    } as unknown as AuthService;

    await TestBed.configureTestingModule({
      imports: [TaskBoardComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: TaskStore, useValue: store },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads tasks on init', () => {
    expect(store.load).toHaveBeenCalled();
    expect(component.tasksFor(TaskStatus.TODO).length).toBe(1);
  });

  it('delegates deletes to the service', () => {
    component.deleteTask(demoTask);
    expect(store.remove).toHaveBeenCalledWith('1');
  });

  it('updates task status when dropping between columns', () => {
    const event = { item: { data: demoTask } } as CdkDragDrop<TaskDto[]>;

    component.drop(event, TaskStatus.DONE);

    expect(store.updateStatus).toHaveBeenCalledWith('1', TaskStatus.DONE);
  });

  it('passes organization id when creating a task', () => {
    component.createForm.setValue({
      title: 'Check inventory',
      description: 'Review supply levels',
      category: TaskCategory.WORK,
    });

    component.createTask();

    expect(store.create).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'org-1' }),
    );
  });

  it('updates filter state through the store', () => {
    component.setCategoryFilter(TaskCategory.PERSONAL);
    expect(store.setCategoryFilter).toHaveBeenCalledWith(TaskCategory.PERSONAL);
  });
});
