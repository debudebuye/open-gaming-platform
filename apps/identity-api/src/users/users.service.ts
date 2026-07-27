import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorCode, ResourceNotFoundException, ConflictException_ } from '@ogp/shared';
import { PasswordService } from '@ogp/auth';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { OffsetPaginationQueryDto, PaginatedResponseDto } from '@ogp/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.userRepo.findOne({ where: [{ email: dto.email }, { username: dto.username }] });
    if (exists) {
      throw new ConflictException_(
        ErrorCode.USER_ALREADY_EXISTS,
        exists.email === dto.email ? 'Email already registered' : 'Username already taken',
      );
    }

    const user = this.userRepo.create({
      email: dto.email,
      username: dto.username,
      passwordHash: await this.passwordService.hash(dto.password),
    });

    const saved = await this.userRepo.save(user);
    return UserResponseDto.fromEntity(saved);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, 'User not found');
    }
    return UserResponseDto.fromEntity(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findAll(query: OffsetPaginationQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    const [users, total] = await this.userRepo.findAndCount({
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(
      users.map(UserResponseDto.fromEntity),
      total,
      query,
    );
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, 'User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.userRepo.findOne({ where: { email: dto.email } });
      if (emailTaken) {
        throw new ConflictException_(ErrorCode.CONFLICT, 'Email already in use');
      }
    }

    if (dto.username && dto.username !== user.username) {
      const usernameTaken = await this.userRepo.findOne({ where: { username: dto.username } });
      if (usernameTaken) {
        throw new ConflictException_(ErrorCode.CONFLICT, 'Username already in use');
      }
    }

    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    return UserResponseDto.fromEntity(saved);
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    return this.update(id, { isActive: false });
  }
}
