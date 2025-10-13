import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, roleSatisfies } from '@vettech/data';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../constants';
import { AuditLogService } from '../services/audit-log.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLog: AuditLogService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | {
          sub: string;
          username: string;
          roles: Role[];
          organizationId?: string | null;
        }
      | undefined;

    const evaluation = this.evaluate(requiredRoles ?? [], user);

    this.auditLog.record({
      timestamp: new Date().toISOString(),
      userId: user?.sub ?? null,
      username: user?.username ?? null,
      organizationId: user?.organizationId ?? null,
      action: `${request.method} ${request.route?.path ?? request.url}`,
      decision: evaluation.allowed ? 'allow' : 'deny',
      detail: evaluation.reason,
    });

    if (!evaluation.allowed) {
      throw new ForbiddenException(evaluation.reason ?? 'Insufficient role for this operation');
    }

    return true;
  }

  private evaluate(required: Role[], user?: { roles: Role[]; organizationId?: string | null }): {
    allowed: boolean;
    reason?: string;
  } {
    if (!user) {
      return { allowed: false, reason: 'Missing user context' };
    }
    if (!user.organizationId) {
      return { allowed: false, reason: 'Missing organization context' };
    }
    if (!user.roles || user.roles.length === 0) {
      return { allowed: false, reason: 'No roles assigned' };
    }
    if (!required.length) {
      return { allowed: true };
    }
    const allowed = this.hasRequiredRole(required, user.roles);
    return allowed ? { allowed: true } : { allowed: false, reason: 'Insufficient role for this operation' };
  }

  private hasRequiredRole(required: Role[], candidateRoles: Role[]): boolean {
    if (!required.length) {
      return true;
    }
    if (!candidateRoles?.length) {
      return false;
    }
    return required.some((role) =>
      candidateRoles.some((candidate) => roleSatisfies(role, candidate)),
    );
  }
}
