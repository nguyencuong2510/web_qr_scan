import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StampService } from './stamp.service';
import {
  AssignStampToProductDto,
  CreateStampGroupDto,
  ListStampGroupDto,
  StampGroupDetailDto,
  SubmitPrivateCodeDto,
  UpdateStampGroupDto,
} from './dtos';
import { ApiResult } from '../../common/classes';

@Controller('admin/stamp')
@ApiTags('Stamp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StampController {
  constructor(private readonly stampService: StampService) {}

  @Get('group')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getListStampGroup(@Query() data: ListStampGroupDto) {
    const result = await this.stampService.getListStampGroup(data);
    return new ApiResult().success(result);
  }

  @Post('group')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createStampGroup(@Body() data: CreateStampGroupDto) {
    const result = await this.stampService.createStampGroup(data);
    return new ApiResult().success(result);
  }

  @Put('group/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStampGroup(
    @Body() data: UpdateStampGroupDto,
    @Param('id') id: number,
  ) {
    const result = await this.stampService.updateStampGroup(id, data);
    return new ApiResult().success(result);
  }

  @Put('assign-to-product')
  @UsePipes(new ValidationPipe({ transform: true }))
  async assignToProduct(@Body() data: AssignStampToProductDto) {
    const result = await this.stampService.assignStampToProduct(data);
    return new ApiResult().success(result);
  }

  @Get('group/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async groupDetail(
    @Query() data: StampGroupDetailDto,
    @Param('id') id: number,
  ) {
    const result = await this.stampService.getStampList(id, data);
    return new ApiResult().success(result);
  }
}

@Controller('stamp')
@ApiTags('Stamp')
export class PublicStampController {
  constructor(private readonly stampService: StampService) {}

  @Get('public/:publicCode')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getProductByCode(@Param('publicCode') code: string) {
    const result = await this.stampService.getProductByCode(code);
    return new ApiResult().success(result);
  }

  @Get('private/:privateCode')
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkStampPrivateCode(@Param('privateCode') code: string) {
    const result = await this.stampService.checkStampPrivateCode(code);
    return new ApiResult().success(result);
  }

  @Post('customer/submit')
  @UsePipes(new ValidationPipe({ transform: true }))
  async submit(@Body() body: SubmitPrivateCodeDto) {
    const result = await this.stampService.submitCustomerWithPrivateCode(body);
    return new ApiResult().success(result);
  }
}
