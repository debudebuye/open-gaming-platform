import { Injectable, Logger } from '@nestjs/common';
import type { INotificationChannel, SendNotificationParams, NotificationResult, NotificationChannel } from './types';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly channels = new Map<NotificationChannel, INotificationChannel>();

  registerChannel(channel: INotificationChannel): void {
    this.channels.set(channel.channel, channel);
    this.logger.log(`Registered notification channel: ${channel.channel}`);
  }

  async send(params: SendNotificationParams): Promise<NotificationResult> {
    const channel = this.channels.get(params.channel);
    if (!channel) {
      throw new Error(`Notification channel "${params.channel}" not available`);
    }
    return channel.send(params);
  }

  async sendMultiChannel(userId: string, template: string, data: Record<string, unknown>, channels: NotificationChannel[]): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    for (const ch of channels) {
      try {
        const result = await this.send({ userId, channel: ch, template, data });
        results.push(result);
      } catch (err) {
        this.logger.error(`Failed to send ${ch} notification: ${err}`);
        results.push({ id: `failed-${ch}`, channel: ch, status: 'failed' });
      }
    }
    return results;
  }

  listChannels(): NotificationChannel[] {
    return Array.from(this.channels.keys());
  }
}
