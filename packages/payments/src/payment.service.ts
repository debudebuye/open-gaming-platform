import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { IPaymentProvider, CreatePaymentParams, PaymentResult, PaymentVerification, RefundResult } from '../types';
import { PaymentStatus } from '../types';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly providers = new Map<string, IPaymentProvider>();

  registerProvider(provider: IPaymentProvider): void {
    this.providers.set(provider.providerName, provider);
    this.logger.log(`Registered payment provider: ${provider.providerName}`);
  }

  getProvider(name: string): IPaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`Payment provider "${name}" not found`);
    return provider;
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async createPayment(providerName: string, params: CreatePaymentParams): Promise<PaymentResult> {
    const provider = this.getProvider(providerName);
    return provider.createPayment(params);
  }

  async verifyPayment(providerName: string, externalId: string): Promise<PaymentVerification> {
    const provider = this.getProvider(providerName);
    return provider.verifyPayment(externalId);
  }

  async refund(providerName: string, externalId: string, amount: number): Promise<RefundResult> {
    const provider = this.getProvider(providerName);
    return provider.refund(externalId, amount);
  }
}
