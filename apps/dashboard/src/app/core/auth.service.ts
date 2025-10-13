import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { LoginDto, JwtPayloadDto, Role, roleSatisfies } from '@vettech/data';

export interface UserContext extends JwtPayloadDto {
  token: string;
}

const STORAGE_KEY = 'vettech.jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly subject = new BehaviorSubject<UserContext | null>(this.restore());

  readonly user$ = this.subject.asObservable();

  get currentUser(): UserContext | null {
    return this.subject.value;
  }

  login(credentials: LoginDto): Observable<void> {
    return this.http.post<{ accessToken: string }>('/api/auth/login', credentials).pipe(
      tap((response) => this.persistToken(response.accessToken)),
      map(() => void 0),
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.subject.next(null);
  }

  get token(): string | null {
    return this.subject.value?.token ?? null;
  }

  isLoggedIn(): boolean {
    return Boolean(this.subject.value);
  }

  hasRole(role: Role): boolean {
    const user = this.subject.value;
    if (!user) {
      return false;
    }
    return user.roles.some((candidate) => roleSatisfies(role, candidate));
  }

  private persistToken(token: string) {
    const decoded = this.decode(token);
    if (!decoded) {
      throw new Error('Unable to decode JWT payload');
    }
    const context: UserContext = { ...decoded, token };
    localStorage.setItem(STORAGE_KEY, token);
    this.subject.next(context);
  }

  private restore(): UserContext | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const decoded = this.decode(stored);
    return decoded ? { ...decoded, token: stored } : null;
  }

  private decode(token: string): JwtPayloadDto | null {
    try {
      const [, payload] = token.split('.');
      const json = atob(payload);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
