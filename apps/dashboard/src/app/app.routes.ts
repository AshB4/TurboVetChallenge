import { Route } from '@angular/router';
import { AuthGuard, AuthGuardChild } from './core/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'tasks',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuardChild],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/task-board/task-board.component').then((m) => m.TaskBoardComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./features/task-detail/task-detail.component').then((m) => m.TaskDetailComponent),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  { path: '**', redirectTo: 'tasks' },
];
