import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { PasswordService } from '@ogp/auth';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: PasswordService, useValue: { hash: jest.fn().mockResolvedValue('hashed'), compare: jest.fn() } },
      ],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const dto = { email: 'test@test.com', username: 'testuser', password: 'password123' };
    repo.findOne!.mockResolvedValue(null);
    repo.create!.mockReturnValue({ id: '1', ...dto, passwordHash: 'hashed', kycStatus: 'pending', isActive: true, createdAt: new Date(), updatedAt: new Date() } as unknown as User);
    repo.save!.mockImplementation(async (u) => u as User);

    const result = await service.create(dto);
    expect(result.email).toBe('test@test.com');
    expect(result.username).toBe('testuser');
  });

  it('should throw on duplicate email', async () => {
    const dto = { email: 'test@test.com', username: 'testuser', password: 'password123' };
    repo.findOne!.mockResolvedValue({ id: '1', email: 'test@test.com' } as User);

    await expect(service.create(dto)).rejects.toThrow();
  });

  it('should find user by id', async () => {
    const user = { id: '1', email: 'test@test.com', username: 'testuser', passwordHash: 'hashed', kycStatus: 'pending', isActive: true, createdAt: new Date(), updatedAt: new Date() } as User;
    repo.findOne!.mockResolvedValue(user);

    const result = await service.findById('1');
    expect(result.id).toBe('1');
  });

  it('should throw on missing user', async () => {
    repo.findOne!.mockResolvedValue(null);
    await expect(service.findById('nonexistent')).rejects.toThrow();
  });

  it('should update user', async () => {
    const user = { id: '1', email: 'old@test.com', username: 'testuser', passwordHash: 'hashed', kycStatus: 'pending', isActive: true, createdAt: new Date(), updatedAt: new Date() } as User;
    repo.findOne!.mockResolvedValueOnce(user).mockResolvedValueOnce(null);
    repo.save!.mockImplementation(async (u) => u as User);

    const result = await service.update('1', { email: 'new@test.com' });
    expect(result.email).toBe('new@test.com');
  });
});
