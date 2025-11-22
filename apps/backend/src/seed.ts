/* eslint-disable no-console */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  CreateTaskDto,
  Permission,
  Role,
  TaskCategory,
  TaskStatus,
} from '@vettech/data';
import {
  Organization,
  Permission as PermissionEntity,
  RoleEntity,
  Task,
  User,
  UserOrganizationRole,
} from './app/entities';

const dbType = (process.env.DB_TYPE ?? 'sqlite').toLowerCase();

const dataSource = new DataSource(
  dbType === 'postgres'
    ? {
        type: 'postgres',
        url: process.env.DB_URL,
        entities: [
          Organization,
          PermissionEntity,
          RoleEntity,
          Task,
          User,
          UserOrganizationRole,
        ],
        synchronize: true,
        logging: false,
      }
    : {
        type: 'sqlite',
        database: process.env.DB_URL ?? 'apps/api/dev.db',
        entities: [
          Organization,
          PermissionEntity,
          RoleEntity,
          Task,
          User,
          UserOrganizationRole,
        ],
        synchronize: true,
        logging: false,
      }
);

async function seed() {
  await dataSource.initialize();

  const permissionRepo = dataSource.getRepository(PermissionEntity);
  const roleRepo = dataSource.getRepository(RoleEntity);
  const orgRepo = dataSource.getRepository(Organization);
  const userRepo = dataSource.getRepository(User);
  const taskRepo = dataSource.getRepository(Task);
  const assignmentRepo = dataSource.getRepository(UserOrganizationRole);

  await dataSource.query('DELETE FROM user_organization_roles');
  await dataSource.query('DELETE FROM tasks');
  await dataSource.query('DELETE FROM users');
  await dataSource.query('DELETE FROM organizations');
  await dataSource.query('DELETE FROM roles');
  await dataSource.query('DELETE FROM permissions');

  const permissions = Object.values(Permission).map((key) =>
    permissionRepo.create({ key })
  );
  await permissionRepo.save(permissions);

  const permissionMap = new Map(
    permissions.map((perm) => [perm.key as Permission, perm])
  );

  const ownerRole = roleRepo.create({
    name: Role.OWNER,
    permissions,
    description: 'Full control of organization data',
  });
  const adminRole = roleRepo.create({
    name: Role.ADMIN,
    permissions: [
      permissionMap.get(Permission.CREATE_TASK)!,
      permissionMap.get(Permission.READ_TASK)!,
      permissionMap.get(Permission.UPDATE_TASK)!,
      permissionMap.get(Permission.DELETE_TASK)!,
      permissionMap.get(Permission.VIEW_AUDIT_LOG)!,
    ],
    description: 'Manage tasks and view audit logs',
  });
  const viewerRole = roleRepo.create({
    name: Role.VIEWER,
    permissions: [permissionMap.get(Permission.READ_TASK)!],
    description: 'Read-only access',
  });
  await roleRepo.save([ownerRole, adminRole, viewerRole]);

  const parentOrg = orgRepo.create({ name: 'TurboVet Clinics' });
  const childOrg = orgRepo.create({
    name: 'TurboVet Downtown',
    parent: parentOrg,
  });
  await orgRepo.save([parentOrg, childOrg]);

  const passwordHash = await bcrypt.hash('P@ssw0rd!', 10);

  const owner = userRepo.create({
    username: 'owner@turbovet.test',
    displayName: 'Olivia Owner',
    passwordHash,
    organization: childOrg,
  });
  const admin = userRepo.create({
    username: 'admin@turbovet.test',
    displayName: 'Alex Admin',
    passwordHash,
    organization: childOrg,
  });
  const viewer = userRepo.create({
    username: 'viewer@turbovet.test',
    displayName: 'Val Viewer',
    passwordHash,
    organization: childOrg,
  });

  await userRepo.save([owner, admin, viewer]);

  const assignments = [
    assignmentRepo.create({
      user: owner,
      organization: childOrg,
      role: Role.OWNER,
    }),
    assignmentRepo.create({
      user: admin,
      organization: childOrg,
      role: Role.ADMIN,
    }),
    assignmentRepo.create({
      user: viewer,
      organization: childOrg,
      role: Role.VIEWER,
    }),
  ];
  await assignmentRepo.save(assignments);

  const tasks: CreateTaskDto[] = [
    {
      title: 'Update vaccination reminders',
      description: 'Review and update the reminder schedule for Q4.',
      status: TaskStatus.IN_PROGRESS,
      category: TaskCategory.WORK,
      organizationId: childOrg.id,
    },
    {
      title: 'Schedule team offsite',
      description: 'Coordinate venue and agenda for the annual offsite.',
      status: TaskStatus.TODO,
      category: TaskCategory.WORK,
      organizationId: childOrg.id,
    },
    {
      title: 'Order new lab supplies',
      description: 'Inventory and place orders for low-stock items.',
      status: TaskStatus.DONE,
      category: TaskCategory.WORK,
      organizationId: childOrg.id,
    },
  ];

  for (const task of tasks) {
    const entity = taskRepo.create({
      title: task.title,
      description: task.description,
      status: task.status!,
      category: task.category!,
      organization: childOrg,
      owner,
    });
    await taskRepo.save(entity);
  }

  console.log('✅ Seed data successfully written to database.');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Failed to seed database', error);
  return dataSource.destroy();
});
