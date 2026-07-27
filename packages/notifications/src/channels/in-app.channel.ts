import { Logger } from '@nestjs/common';
import type { INotificationChannel, SendNotificationParams, NotificationResult } from '../types';

export class InAppChannel implements INotificationChannel {
  readonly channel = 'in_app' as const;
  private readonly logger = new Logger(InAppChannel.name);

  async send(params: SendNotificationParams): Promise<NotificationResult> {
    this.logger.log(`Sending in-app notification to user ${params.userId}: ${params.template}`);
    return {
      id: `inapp-${Date.now()}`,
      channel: 'in_app',
      status: 'delivered',
    };
  }
}
