import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiResult } from '../../common/classes';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetCustomerList, GetGameHistoryListDto } from './dtos';

@Controller('admin/customer')
@ApiTags('customer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAllCustomers(@Query() data: GetCustomerList) {
    const result = await this.customerService.getCustomersList(data);
    return new ApiResult().success(result);
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getCustomerDetail(
    @Param('id') id: string,
    @Query() data: GetGameHistoryListDto,
  ) {
    const result = await this.customerService.getCustomerDetail(id, data);
    return new ApiResult().success(result);
  }
}
