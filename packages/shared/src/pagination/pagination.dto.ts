import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/** Query params for offset-based pagination */
export class OffsetPaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

/** Query params for cursor-based pagination */
export class CursorPaginationQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

/** Paginated response envelope */
export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  constructor(data: T[], total: number, query: OffsetPaginationQueryDto) {
    this.data = data;
    const totalPages = Math.ceil(total / query.limit);
    this.meta = {
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPrevPage: query.page > 1,
    };
  }
}

/** Cursor-based response envelope */
export class CursorPaginatedResponseDto<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };

  constructor(data: T[], nextCursor: string | null, limit: number) {
    this.data = data;
    this.meta = {
      nextCursor,
      hasNextPage: nextCursor !== null,
      limit,
    };
  }
}
