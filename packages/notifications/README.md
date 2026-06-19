# @ogp/notifications

Multi-channel notification delivery — Email, SMS, Push, and In-App.

## Exports

- `INotificationChannel` — Interface all channels implement
- `NotificationService` — Route notifications to correct channel(s)
- `TemplateService` — Render notification templates with dynamic data
- Built-in channels: `EmailChannel` (SendGrid/SMTP), `SmsChannel` (Twilio), `PushChannel` (Firebase), `InAppChannel`
- Events: `NotificationSentEvent`, `NotificationFailedEvent`

## INotificationChannel Interface

```typescript
export interface INotificationChannel {
  readonly channelId: string;
  send(notification: NotificationPayload): Promise<void>;
  isAvailable(): boolean;
}
```

## Usage

The notifications package subscribes to domain events from the event bus and triggers the appropriate notification:

| Domain Event            | Notification Triggered               |
|-------------------------|--------------------------------------|
| `gaming.bet.settled`    | "Your bet has been settled"          |
| `gaming.keno-ticket.won`| "You won on Keno!"                  |
| `payments.deposit.confirmed` | "Deposit of $X confirmed"       |
| `wallet.balance.credited`| "Your wallet has been credited"     |
| `identity.user.kyc-approved` | "Your account is verified"     |
