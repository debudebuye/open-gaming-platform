export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface SendNotificationParams {
  userId: string;
  channel: NotificationChannel;
  template: string;
  data: Record<string, unknown>;
}

export interface NotificationResult {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
}

export interface INotificationChannel {
  readonly channel: NotificationChannel;
  send(params: SendNotificationParams): Promise<NotificationResult>;
}
