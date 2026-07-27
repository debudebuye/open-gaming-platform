export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export interface IPaymentProvider {
  readonly providerName: string;

  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  verifyPayment(externalId: string): Promise<PaymentVerification>;
  refund(externalId: string, amount: number): Promise<RefundResult>;
}

export interface CreatePaymentParams {
  userId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  externalId: string;
  status: PaymentStatus;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentVerification {
  externalId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
}

export interface RefundResult {
  externalId: string;
  status: PaymentStatus;
}
