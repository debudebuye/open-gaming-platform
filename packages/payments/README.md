# @ogp/payments

Payment provider integrations — deposits, withdrawals, and webhook handling.

## Exports

- `IPaymentProvider` — Interface all providers must implement
- `PaymentService` — Provider-agnostic deposit/withdrawal orchestration
- `WebhookVerifier` — HMAC signature verification per provider
- Built-in providers: `StripeProvider`, `FlutterwaveProvider`, `MPesaProvider`

## IPaymentProvider Interface

```typescript
export interface IPaymentProvider {
  readonly providerId: string;

  initiateDeposit(params: DepositParams): Promise<PaymentIntent>;
  initiateWithdrawal(params: WithdrawalParams): Promise<WithdrawalResult>;
  verifyWebhook(payload: Buffer, signature: string): boolean;
  parseWebhookEvent(payload: Buffer): PaymentWebhookEvent;
}
```

## Adding a New Provider

1. Implement `IPaymentProvider`
2. Register it with `PaymentsModule.forProviders([new MyProvider()])`
3. The `PaymentService` routes transactions to the correct provider by `providerId`

## Security

All webhook endpoints verify HMAC/RSA signatures before processing. Raw request body is preserved for signature verification.
