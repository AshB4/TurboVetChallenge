import { Body, Controller, Delete, Get, Param, Post, Put, Request } from '@nestjs/common';
import { AuditLogService, Roles } from '@vettech/auth';
import { CreateTaskDto, JwtPayloadDto, Role, UpdateTaskDto } from '@vettech/data';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post('tasks')
  @Roles(Role.ADMIN, Role.OWNER)
  createTask(@Body() body: CreateTaskDto, @Request() req: { user: JwtPayloadDto }) {
    return this.tasksService.createTask(body, req.user);
  }

  @Get('tasks')
  @Roles(Role.VIEWER)
  getTasks(@Request() req: { user: JwtPayloadDto }) {
    return this.tasksService.findAllForUser(req.user);
  }

  @Put('tasks/:id')
  @Roles(Role.ADMIN, Role.OWNER)
  updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Request() req: { user: JwtPayloadDto },
  ) {
    return this.tasksService.updateTask(id, body, req.user);
  }

  @Delete('tasks/:id')
  @Roles(Role.ADMIN, Role.OWNER)
  deleteTask(@Param('id') id: string, @Request() req: { user: JwtPayloadDto }) {
    return this.tasksService.removeTask(id, req.user);
  }

  @Get('audit-log')
  @Roles(Role.ADMIN, Role.OWNER)
  getAuditLog(@Request() req: { user: JwtPayloadDto }) {
    return this.auditLogService.forOrganization(req.user.organizationId);
  }
}
