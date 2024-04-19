import {
  Controller,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MainService } from './main.service';
import { ApiResult } from '../../common/classes';

@Controller('admin/main')
@ApiTags('Main')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MainController {
  constructor(private readonly mainService: MainService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMain() {
    const result = await this.mainService.getMain();
    return new ApiResult().success(result);
  }
}
