export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.OWNER]: [Role.OWNER, Role.ADMIN, Role.VIEWER],
  [Role.ADMIN]: [Role.ADMIN, Role.VIEWER],
  [Role.VIEWER]: [Role.VIEWER],
};

export function roleSatisfies(required: Role, candidate: Role): boolean {
  const allowed = ROLE_HIERARCHY[candidate] ?? [];
  return allowed.includes(required);
}
