import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@vettech/data';
import { AuditLogService } from '../services/audit-log.service';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../constants';
import { RbacGuard } from './rbac.guard';

const makeContext = (
  userRoles: Role[] | undefined,
  options: {
    method?: string;
    path?: string;
    organizationId?: string | null;
  } = {}
) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        method: options.method ?? 'GET',
        route: { path: options.path ?? '/tasks' },
        url: options.path ?? '/tasks',
        user: userRoles
          ? {
              sub: '123',
              username: 'user',
              organizationId:
                'organizationId' in options ? options.organizationId : 'org-1',
              roles: userRoles,
            }
          : undefined,
      }),
    }),
    getClass: () => ({}),
    getHandler: () => ({}),
  } as any);

const mockMetadata = (
  reflector: Reflector,
  roles: Role[] | undefined,
  isPublic = false
) => {
  (reflector.getAllAndOverride as jest.Mock).mockImplementation(
    (key: string) => {
      if (key === ROLES_KEY) {
        return roles;
      }
      if (key === IS_PUBLIC_KEY) {
        return isPublic;
      }
      return undefined;
    }
  );
};

describe('RbacGuard', () => {
  let reflector: Reflector;
  let auditLog: AuditLogService;
  let guard: RbacGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    auditLog = new AuditLogService();
    guard = new RbacGuard(reflector, auditLog);
  });

  const decisionTable: Array<{
    description: string;
    candidate: Role;
    required: Role;
    method: string;
    path: string;
    allowed: boolean;
  }> = [
    {
      description: 'owner can create tasks',
      candidate: Role.OWNER,
      required: Role.ADMIN,
      method: 'POST',
      path: '/tasks',
      allowed: true,
    },
    {
      description: 'admin can create tasks',
      candidate: Role.ADMIN,
      required: Role.ADMIN,
      method: 'POST',
      path: '/tasks',
      allowed: true,
    },
    {
      description: 'viewer cannot create tasks',
      candidate: Role.VIEWER,
      required: Role.ADMIN,
      method: 'POST',
      path: '/tasks',
      allowed: false,
    },
    {
      description: 'viewer can list tasks',
      candidate: Role.VIEWER,
      required: Role.VIEWER,
      method: 'GET',
      path: '/tasks',
      allowed: true,
    },
    {
      description: 'admin can access audit log',
      candidate: Role.ADMIN,
      required: Role.ADMIN,
      method: 'GET',
      path: '/audit-log',
      allowed: true,
    },
    {
      description: 'viewer cannot access audit log',
      candidate: Role.VIEWER,
      required: Role.ADMIN,
      method: 'GET',
      path: '/audit-log',
      allowed: false,
    },
    {
      description: 'owner can delete tasks',
      candidate: Role.OWNER,
      required: Role.ADMIN,
      method: 'DELETE',
      path: '/tasks/:id',
      allowed: true,
    },
    {
      description: 'admin cannot perform owner-only actions',
      candidate: Role.ADMIN,
      required: Role.OWNER,
      method: 'POST',
      path: '/organizations',
      allowed: false,
    },
  ];

  decisionTable.forEach(
    ({ description, candidate, required, method, path, allowed }) => {
      it(`${
        allowed ? 'allows' : 'blocks'
      } ${candidate} when ${description}`, () => {
        mockMetadata(reflector, [required]);
        const context = makeContext([candidate], { method, path });
        if (allowed) {
          expect(guard.canActivate(context)).toBe(true);
        } else {
          expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        }
        jest.clearAllMocks();
      });
    }
  );

  it('allows public routes without user context', () => {
    mockMetadata(reflector, undefined, true);
    const context = makeContext(undefined, { method: 'GET', path: '/health' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('blocks requests without a user', () => {
    mockMetadata(reflector, [Role.VIEWER]);
    const context = makeContext(undefined);
    expect(() => guard.canActivate(context)).toThrow('Missing user context');
  });

  it('blocks requests missing organization context', () => {
    mockMetadata(reflector, [Role.VIEWER]);
    const context = makeContext([Role.VIEWER], { organizationId: null });
    expect(() => guard.canActivate(context)).toThrow(
      'Missing organization context'
    );
  });

  it('blocks requests for users without roles', () => {
    mockMetadata(reflector, [Role.VIEWER]);
    const context = makeContext([], { method: 'GET' });
    expect(() => guard.canActivate(context)).toThrow('No roles assigned');
  });
});
