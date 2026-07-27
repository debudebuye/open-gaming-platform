import { Module, DynamicModule } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtService } from './jwt.service';
import type { JwtConfig } from './jwt.types';

@Module({})
export class JwtAuthModule {
  static forRoot(config: JwtConfig): DynamicModule {
    return {
      module: JwtAuthModule,
      imports: [
        NestJwtModule.register({
          secret: config.secret,
          signOptions: { algorithm: 'HS256' },
        }),
      ],
      providers: [
        {
          provide: JwtService,
          useFactory: (jwt: NestJwtService) => new JwtService(jwt, config),
          inject: [NestJwtService],
        },
      ],
      exports: [JwtService, NestJwtModule],
    };
  }
}
