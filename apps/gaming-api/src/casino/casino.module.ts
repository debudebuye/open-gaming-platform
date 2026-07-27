import { Module, DynamicModule } from '@nestjs/common';
import { ICasinoGame } from '@ogp/casino';
import { CasinoService } from './casino.service';
import { CasinoController } from './casino.controller';

@Module({})
export class CasinoModule {
  static forPlugins(plugins: ICasinoGame[]): DynamicModule {
    return {
      module: CasinoModule,
      controllers: [CasinoController],
      providers: [
        CasinoService,
        {
          provide: 'CASINO_PLUGINS',
          useFactory: (casinoService: CasinoService) => {
            for (const plugin of plugins) {
              casinoService.registerPlugin(plugin);
            }
            return plugins;
          },
          inject: [CasinoService],
        },
      ],
      exports: [CasinoService],
    };
  }
}
