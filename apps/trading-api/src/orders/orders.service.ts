import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { Order, Trade, Instrument, OrderStatus, OrderSide, OrderType, OrderBookService, RiskService, PositionService } from '@ogp/trading';
import { PlaceOrderDto } from '@ogp/trading';
import { ErrorCode, ConflictException_, ResourceNotFoundException } from '@ogp/shared';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Trade) private readonly tradeRepo: Repository<Trade>,
    @InjectRepository(Instrument) private readonly instrumentRepo: Repository<Instrument>,
    private readonly orderBookService: OrderBookService,
    private readonly riskService: RiskService,
    private readonly positionService: PositionService,
    private readonly dataSource: DataSource,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async placeOrder(userId: string, dto: PlaceOrderDto): Promise<Order> {
    const instrument = await this.instrumentRepo.findOne({ where: { id: dto.instrumentId } });
    if (!instrument) throw new ResourceNotFoundException(ErrorCode.TRADING_INSTRUMENT_INACTIVE, 'Instrument not found');
    if (instrument.status !== 'ACTIVE') throw new ConflictException_(ErrorCode.TRADING_INSTRUMENT_INACTIVE, 'Instrument not active');

    const riskCheck = await this.riskService.checkOrder(userId, dto.instrumentId, dto.quantity, dto.price ?? 0);
    if (!riskCheck.allowed) {
      throw new ConflictException_(ErrorCode.TRADING_POSITION_LIMIT_EXCEEDED, riskCheck.reason);
    }

    const order = this.orderRepo.create({
      userId,
      instrumentId: dto.instrumentId,
      side: dto.side,
      type: dto.type,
      quantity: dto.quantity,
      price: dto.price,
      stopPrice: dto.stopPrice,
      status: dto.type === 'MARKET' ? OrderStatus.OPEN : OrderStatus.PENDING,
    });
    const savedOrder = await this.orderRepo.save(order);

    if (dto.type === 'MARKET') {
      await this.executeMarketOrder(savedOrder, instrument);
    } else {
      await this.insertRestingOrder(savedOrder, instrument);
    }

    return savedOrder;
  }

  private async executeMarketOrder(order: Order, instrument: Instrument): Promise<void> {
    const symbol = instrument.symbol;
    let remaining = Number(order.quantity);

    if (order.side === OrderSide.BUY) {
      while (remaining > 0) {
        const bestAsk = await this.orderBookService.getBestAsk(symbol);
        if (!bestAsk) break;

        const fillQty = Math.min(remaining, 1);
        await this.createTrade(order, bestAsk.orderId, fillQty, bestAsk.price, instrument);
        remaining -= fillQty;
      }
    } else {
      while (remaining > 0) {
        const bestBid = await this.orderBookService.getBestBid(symbol);
        if (!bestBid) break;

        const fillQty = Math.min(remaining, 1);
        await this.createTrade(order, bestBid.orderId, fillQty, bestBid.price, instrument);
        remaining -= fillQty;
      }
    }

    if (remaining === 0) {
      order.status = OrderStatus.FILLED;
    } else if (remaining < Number(order.quantity)) {
      order.status = OrderStatus.PARTIALLY_FILLED;
    } else {
      order.status = OrderStatus.CANCELLED;
    }
    await this.orderRepo.save(order);
  }

  private async insertRestingOrder(order: Order, instrument: Instrument): Promise<void> {
    const symbol = instrument.symbol;
    if (order.side === OrderSide.BUY) {
      await this.orderBookService.addBid(symbol, Number(order.price), order.id);
    } else {
      await this.orderBookService.addAsk(symbol, Number(order.price), order.id);
    }
    order.status = OrderStatus.OPEN;
    await this.orderRepo.save(order);
  }

  private async createTrade(
    incomingOrder: Order,
    restingOrderId: string,
    quantity: number,
    price: number,
    instrument: Instrument,
  ): Promise<void> {
    const isBuy = incomingOrder.side === OrderSide.BUY;
    const trade = this.tradeRepo.create({
      buyOrderId: isBuy ? incomingOrder.id : restingOrderId,
      sellOrderId: isBuy ? restingOrderId : incomingOrder.id,
      quantity,
      price,
      executedAt: new Date(),
    });
    await this.tradeRepo.save(trade);

    const buyerId = isBuy ? incomingOrder.userId : (await this.orderRepo.findOne({ where: { id: restingOrderId } }))?.userId;
    const sellerId = isBuy ? (await this.orderRepo.findOne({ where: { id: restingOrderId } }))?.userId : incomingOrder.userId;

    if (buyerId) await this.positionService.upsert(buyerId, instrument.id, quantity, price);
    if (sellerId) await this.positionService.upsert(sellerId, instrument.id, -quantity, price);

    this.logger.log(`Trade: ${quantity} ${instrument.symbol} @ ${price}`);
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new ResourceNotFoundException(ErrorCode.TRADING_ORDER_NOT_FOUND, 'Order not found');
    return order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const order = await this.getOrder(id);
    if (order.userId !== userId) throw new ConflictException_(ErrorCode.FORBIDDEN, 'Not your order');
    if (order.status !== OrderStatus.OPEN && order.status !== OrderStatus.PENDING) {
      throw new ConflictException_(ErrorCode.CONFLICT, 'Order cannot be cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    await this.orderRepo.save(order);

    const instrument = await this.instrumentRepo.findOne({ where: { id: order.instrumentId } });
    if (instrument) {
      if (order.side === OrderSide.BUY) {
        await this.orderBookService.removeBid(instrument.symbol, order.id);
      } else {
        await this.orderBookService.removeAsk(instrument.symbol, order.id);
      }
    }

    return order;
  }
}
