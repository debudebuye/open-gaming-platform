import { Logger } from '@nestjs/common';
import type { INotificationChannel, SendNotificationParams, NotificationResult } from '../types';

export class PushChannel implements INotificationChannel {
  readonly channel = 'push' as const;
  private readonly logger = new Logger(PushChannel.name);

  constructor(private readonly firebaseKey: string) {}

  async send(params: SendNotificationParams): Promise<NotificationResult> {
    this.logger.log(`Sending push to user ${params.userId}: ${params.template}`);
    return {
      id: `push-${Date.now()}`,
      channel: 'push',
      status: 'sent',
    };
  }
}
