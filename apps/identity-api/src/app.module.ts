import { Controller, Get } from '@nestjs/common';
import { Module } from '@nestjs/common';

@Controller()
class HealthController {
  @Get('/health')
  healthRoot() {
    return { status: 'ok' };
  }

  @Get('health')
  healthNoLeadingSlash() {
    return { status: 'ok' };
  }
}

@Module({
  controllers: [HealthController],
})
export class AppModule {}

