import Redis from 'ioredis';

export class OrderBookService {
  constructor(private readonly redis: Redis) {}

  private bidsKey(symbol: string): string { return `ob:${symbol}:bids`; }
  private asksKey(symbol: string): string { return `ob:${symbol}:asks`; }

  async addBid(symbol: string, price: number, orderId: string): Promise<void> {
    await this.redis.zadd(this.bidsKey(symbol), price, orderId);
  }

  async addAsk(symbol: string, price: number, orderId: string): Promise<void> {
    await this.redis.zadd(this.asksKey(symbol), price, orderId);
  }

  async removeBid(symbol: string, orderId: string): Promise<void> {
    await this.redis.zrem(this.bidsKey(symbol), orderId);
  }

  async removeAsk(symbol: string, orderId: string): Promise<void> {
    await this.redis.zrem(this.asksKey(symbol), orderId);
  }

  async getBestAsk(symbol: string): Promise<{ orderId: string; price: number } | null> {
    const result = await this.redis.zrange(this.asksKey(symbol), 0, 0, 'WITHSCORES');
    if (result.length < 2) return null;
    return { orderId: result[0], price: parseFloat(result[1]) };
  }

  async getBestBid(symbol: string): Promise<{ orderId: string; price: number } | null> {
    const result = await this.redis.zrevrange(this.bidsKey(symbol), 0, 0, 'WITHSCORES');
    if (result.length < 2) return null;
    return { orderId: result[0], price: parseFloat(result[1]) };
  }

  async getAskDepth(symbol: string, depth: number = 10): Promise<{ orderId: string; price: number }[]> {
    const results = await this.redis.zrange(this.asksKey(symbol), 0, depth - 1, 'WITHSCORES');
    const pairs: { orderId: string; price: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      pairs.push({ orderId: results[i], price: parseFloat(results[i + 1]) });
    }
    return pairs;
  }

  async getBidDepth(symbol: string, depth: number = 10): Promise<{ orderId: string; price: number }[]> {
    const results = await this.redis.zrevrange(this.bidsKey(symbol), 0, depth - 1, 'WITHSCORES');
    const pairs: { orderId: string; price: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      pairs.push({ orderId: results[i], price: parseFloat(results[i + 1]) });
    }
    return pairs;
  }
}
