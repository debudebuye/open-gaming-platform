import { NotificationService } from '../notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockChannel = {
    channel: 'email' as const,
    send: jest.fn().mockResolvedValue({ id: 'n1', channel: 'email', status: 'sent' }),
  };

  beforeEach(() => {
    service = new NotificationService();
    service.registerChannel(mockChannel);
  });

  it('should register and list channels', () => {
    expect(service.listChannels()).toContain('email');
  });

  it('should send notification', async () => {
    const result = await service.send({ userId: 'u1', channel: 'email', template: 'welcome', data: {} });
    expect(result.status).toBe('sent');
  });

  it('should throw for unavailable channel', async () => {
    await expect(service.send({ userId: 'u1', channel: 'sms', template: 'welcome', data: {} })).rejects.toThrow();
  });

  it('should send multi-channel', async () => {
    const results = await service.sendMultiChannel('u1', 'welcome', {}, ['email']);
    expect(results).toHaveLength(1);
  });
});
