import { Logger } from '@nestjs/common';
import type { INotificationChannel, SendNotificationParams, NotificationResult } from '../types';

export class EmailChannel implements INotificationChannel {
  readonly channel = 'email' as const;
  private readonly logger = new Logger(EmailChannel.name);

  constructor(private readonly smtpHost: string, private readonly smtpPort: number) {}

  async send(params: SendNotificationParams): Promise<NotificationResult> {
    this.logger.log(`Sending email to user ${params.userId}: ${params.template}`);
    return {
      id: `email-${Date.now()}`,
      channel: 'email',
      status: 'sent',
    };
  }
}
