import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Session } from '../users/entities/session.entity';
import { OffsetPaginationQueryDto, PaginatedResponseDto } from '@ogp/shared';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
  ) {}

  async create(userId: string, refreshTokenHash: string, expiresAt: Date, deviceInfo?: string): Promise<Session> {
    const session = this.sessionRepo.create({
      userId,
      refreshTokenHash,
      expiresAt,
      deviceInfo,
    });
    return this.sessionRepo.save(session);
  }

  async findActiveForUser(userId: string): Promise<Session[]> {
    return this.sessionRepo.find({
      where: { userId, expiresAt: LessThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(query: OffsetPaginationQueryDto): Promise<PaginatedResponseDto<Session>> {
    const [sessions, total] = await this.sessionRepo.findAndCount({
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(sessions, total, query);
  }

  async revoke(id: string): Promise<void> {
    await this.sessionRepo.delete(id);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.sessionRepo.delete({ userId });
  }
}
