import { Injectable } from '@nestjs/common';

export interface AuditLogEntry {
  timestamp: string;
  userId: string | null;
  username: string | null;
  organizationId: string | null;
  action: string;
  decision: 'allow' | 'deny';
  detail?: string;
}

@Injectable()
export class AuditLogService {
  private readonly buffer: AuditLogEntry[] = [];
  private readonly maxEntries = 200;

  record(entry: AuditLogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length > this.maxEntries) {
      this.buffer.shift();
    }
    const { username, organizationId, action, decision, detail } = entry;
    // eslint-disable-next-line no-console
    console.log(
      `[audit] user=${username ?? 'anonymous'} org=${organizationId ?? 'n/a'} action=${action} decision=${decision}` +
        (detail ? ` detail=${detail}` : ''),
    );
  }

  all(): AuditLogEntry[] {
    return [...this.buffer].reverse();
  }

  forOrganization(organizationId: string): AuditLogEntry[] {
    return this.all().filter((entry) => entry.organizationId === organizationId);
  }
}
