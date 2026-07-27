import { Exclude, Expose } from 'class-transformer';
import type { KycStatus } from '../entities/kyc-status.enum';

export class UserResponseDto {
  @Expose() id!: string;
  @Expose() email!: string;
  @Expose() username!: string;
  @Expose() kycStatus!: KycStatus;
  @Expose() isActive!: boolean;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;

  @Exclude() passwordHash!: string;

  static fromEntity(entity: { id: string; email: string; username: string; passwordHash: string; kycStatus: KycStatus; isActive: boolean; createdAt: Date; updatedAt: Date }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.username = entity.username;
    dto.kycStatus = entity.kycStatus;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
