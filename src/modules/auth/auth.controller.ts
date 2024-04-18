import {
  Controller,
  Body,
  Post,
  UsePipes,
  ValidationPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/user.decorator';
import { ChangePasswordDTO, LoginDto, TokenUserInfo } from './dtos';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiResult } from '../../common/classes';

@Controller('admin/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() data: LoginDto) {
    const result = await this.authService.login(data);

    return new ApiResult().success(result);
  }
}

@Controller('admin/auth')
@ApiTags('Auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PrivateAuthController {
  constructor(private readonly authService: AuthService) {}

  @Put('change-password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async changePass(
    @Body() data: ChangePasswordDTO,
    @CurrentUser() currentUser: TokenUserInfo,
  ) {
    const result = await this.authService.changePassword(data, currentUser.id);

    return new ApiResult().success(result);
  }
}
