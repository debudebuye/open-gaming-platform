import { Logger } from '@nestjs/common';
import type { INotificationChannel, SendNotificationParams, NotificationResult } from '../types';

export class SmsChannel implements INotificationChannel {
  readonly channel = 'sms' as const;
  private readonly logger = new Logger(SmsChannel.name);

  constructor(private readonly apiKey: string) {}

  async send(params: SendNotificationParams): Promise<NotificationResult> {
    this.logger.log(`Sending SMS to user ${params.userId}: ${params.template}`);
    return {
      id: `sms-${Date.now()}`,
      channel: 'sms',
      status: 'sent',
    };
  }
}
