import { Global, Module } from '@nestjs/common';
import { AuditLogService } from '@vettech/auth';

@Global()
@Module({
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
