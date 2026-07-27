import { Logger } from '@nestjs/common';
import type { IPaymentProvider, CreatePaymentParams, PaymentResult, PaymentVerification, RefundResult } from '../types';
import { PaymentStatus } from '../types';

export class MpesaProvider implements IPaymentProvider {
  readonly providerName = 'mpesa';
  private readonly logger = new Logger(MpesaProvider.name);

  constructor(private readonly consumerKey: string, private readonly consumerSecret: string) {}

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    this.logger.log(`Creating M-Pesa payment: ${params.amount} ${params.currency}`);
    return {
      externalId: `mpesa_${Date.now()}`,
      status: PaymentStatus.PENDING,
    };
  }

  async verifyPayment(externalId: string): Promise<PaymentVerification> {
    this.logger.log(`Verifying M-Pesa payment: ${externalId}`);
    return {
      externalId,
      status: PaymentStatus.COMPLETED,
      amount: 0,
      currency: 'KES',
    };
  }

  async refund(externalId: string, amount: number): Promise<RefundResult> {
    this.logger.log(`Refunding M-Pesa payment: ${externalId}`);
    return { externalId, status: PaymentStatus.REFUNDED };
  }
}
