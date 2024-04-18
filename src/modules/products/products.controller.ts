import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiResult } from '../../common/classes';
import { CreateProductDto, GetListProductDto, UpdateProductDto } from './dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/products')
@ApiTags('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getList(@Query() data: GetListProductDto) {
    const result = await this.productService.getList(data);
    return new ApiResult().success(result);
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getProductById(@Param('id') id: number) {
    const result = await this.productService.getById(id);
    return new ApiResult().success(result);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createProduct(@Body() data: CreateProductDto) {
    const result = await this.productService.create(data);
    return new ApiResult().success(result);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProduct(@Body() data: UpdateProductDto, @Param('id') id: number) {
    const result = await this.productService.update(id, data);
    return new ApiResult().success(result);
  }

  @Delete(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteProduct(@Param('id') id: number) {
    const result = await this.productService.delete(id);
    return new ApiResult().success(result);
  }
}
