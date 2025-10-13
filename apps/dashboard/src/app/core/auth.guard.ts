import { Injectable, inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
  canActivateChild(): boolean {
    return this.canActivate();
  }
}

export const AuthGuard: CanActivateFn = () => inject(AuthGuardService).canActivate();
export const AuthGuardChild: CanActivateChildFn = () =>
  inject(AuthGuardService).canActivateChild();
