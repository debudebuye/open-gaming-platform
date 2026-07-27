import { OrderBookService } from './order-book.service';

describe('OrderBookService', () => {
  let service: OrderBookService;
  let redis: any;

  beforeEach(() => {
    redis = {
      zadd: jest.fn().mockResolvedValue(1),
      zrem: jest.fn().mockResolvedValue(1),
      zrange: jest.fn().mockResolvedValue(['order-1', '50000']),
      zrevrange: jest.fn().mockResolvedValue(['order-2', '49999']),
    };
    service = new OrderBookService(redis);
  });

  it('should add a bid', async () => {
    await service.addBid('BTCUSD', 50000, 'order-1');
    expect(redis.zadd).toHaveBeenCalledWith('ob:BTCUSD:bids', 50000, 'order-1');
  });

  it('should add an ask', async () => {
    await service.addAsk('BTCUSD', 51000, 'order-2');
    expect(redis.zadd).toHaveBeenCalledWith('ob:BTCUSD:asks', 51000, 'order-2');
  });

  it('should get best ask', async () => {
    const result = await service.getBestAsk('BTCUSD');
    expect(result).toEqual({ orderId: 'order-1', price: 50000 });
  });

  it('should get best bid', async () => {
    const result = await service.getBestBid('BTCUSD');
    expect(result).toEqual({ orderId: 'order-2', price: 49999 });
  });

  it('should return null for empty book', async () => {
    redis.zrange.mockResolvedValue([]);
    const result = await service.getBestAsk('EMPTY');
    expect(result).toBeNull();
  });
});
