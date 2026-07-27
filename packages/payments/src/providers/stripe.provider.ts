import { Logger } from '@nestjs/common';
import type { IPaymentProvider, CreatePaymentParams, PaymentResult, PaymentVerification, RefundResult } from '../types';
import { PaymentStatus } from '../types';

export interface StripeConfig {
  secretKey: string;
  checkoutBaseUrl?: string;
}

export class StripeProvider implements IPaymentProvider {
  readonly providerName = 'stripe';
  private readonly logger = new Logger(StripeProvider.name);
  private readonly checkoutBaseUrl: string;

  constructor(config: StripeConfig) {
    this.checkoutBaseUrl = config.checkoutBaseUrl ?? 'https://checkout.stripe.com/pay';
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    this.logger.log(`Creating Stripe payment: ${params.amount} ${params.currency}`);
    return {
      externalId: `stripe_${Date.now()}`,
      status: PaymentStatus.PENDING,
      redirectUrl: `${this.checkoutBaseUrl}/${params.amount}`,
    };
  }

  async verifyPayment(externalId: string): Promise<PaymentVerification> {
    this.logger.log(`Verifying Stripe payment: ${externalId}`);
    return {
      externalId,
      status: PaymentStatus.COMPLETED,
      amount: 0,
      currency: 'USD',
    };
  }

  async refund(externalId: string, amount: number): Promise<RefundResult> {
    this.logger.log(`Refunding Stripe payment: ${externalId}, amount: ${amount}`);
    return { externalId, status: PaymentStatus.REFUNDED };
  }
}
