import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Public } from '@ogp/shared';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/token-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  async logout(
    @Req() req: { user?: { sub?: string } },
    @Body() body?: { refreshToken?: string },
  ) {
    const userId = req.user?.sub;
    if (userId) {
      await this.authService.logout(userId, body?.refreshToken);
    }
    return { success: true };
  }
}
