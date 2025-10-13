import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let auth: (Partial<AuthService> & { login: jest.Mock });
  let router: Partial<Router> & { navigate: jest.Mock };

  beforeEach(async () => {
    auth = { login: jest.fn() };
    router = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('submits credentials and navigates on success', () => {
    auth.login.mockReturnValue(of(void 0));
    component.form.setValue({ username: 'owner@turbovet.test', password: 'secret1' });

    component.submit();

    expect(auth.login).toHaveBeenCalledWith({ username: 'owner@turbovet.test', password: 'secret1' });
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('shows an error when login fails', () => {
    auth.login.mockReturnValue(throwError(() => new Error('fail')));
    component.form.setValue({ username: 'owner@turbovet.test', password: 'secret1' });

    component.submit();
    fixture.detectChanges();

    expect(component.error()).toContain('Login failed');
  });
});
