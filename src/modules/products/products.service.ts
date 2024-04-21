import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../database/models';
import { ILike, IsNull, Repository } from 'typeorm';
import { CreateProductDto, GetListProductDto, UpdateProductDto } from './dtos';
import { ApiError } from '../../common/classes';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getList(data: GetListProductDto) {
    const { name, limit, page } = data;

    const skip = (page - 1) * limit;

    const query = {
      name: name ? ILike(`%${name}%`) : undefined,
    };

    const [products, total] = await Promise.all([
      this.productRepo.find({
        where: query,
        take: limit,
        skip,
        order: { updatedAt: 'DESC' },
      }),
      this.productRepo.count({
        where: query,
      }),
    ]);

    return {
      data: products,
      total,
    };
  }

  async getById(id: number) {
    return await this.productRepo.findOneBy({ id });
  }

  async create(data: CreateProductDto) {
    const product = this.productRepo.create(data);
    return await this.productRepo.save(product);
  }

  async update(id: number, data: UpdateProductDto) {
    const product = await this.productRepo.findOneBy({
      id,
      deletedAt: IsNull(),
    });
    if (!product) {
      throw new ApiError('Product not found');
    }
    return await this.productRepo.save({
      ...product,
      ...data,
      updatedAt: new Date(),
    });
  }

  async delete(id: number) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) {
      throw new ApiError('Product not found');
    }
    return await this.productRepo.update(
      { id: product.id },
      { deletedAt: new Date() },
    );
  }
}
