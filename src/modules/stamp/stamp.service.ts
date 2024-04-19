import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  Customer,
  GameHistory,
  GamePrize,
  GameProgram,
  Product,
  Stamp,
  StampGroup,
} from '../../database/models';
import { Brackets, EntityManager, ILike, Repository } from 'typeorm';
import { ApiError } from '../../common/classes';
import {
  AssignStampToProductDto,
  CreateStampGroupDto,
  ListStampGroupDto,
  SubmitPrivateCodeDto,
  UpdateStampGroupDto,
} from './dtos';
import { CommonService } from '../../common/services';

@Injectable()
export class StampService {
  constructor(
    @InjectRepository(StampGroup)
    private readonly stampGroupRepo: Repository<StampGroup>,
    @InjectRepository(Stamp)
    private readonly stampRepo: Repository<Stamp>,
    @InjectRepository(GameHistory)
    private readonly gameHistoryRepo: Repository<GameHistory>,

    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async createStampGroup(data: CreateStampGroupDto) {
    const { name, prefix, from, to } = data;

    return await this.entityManager.transaction(async (transaction) => {
      const existName = await transaction.findOneBy(StampGroup, {
        name,
      } as StampGroup);

      if (existName) throw new ApiError('Stamp group name already exist');

      const amountStamp = to - from + 1;
      const stampGroup = await transaction.save(StampGroup, {
        name,
        amountStamp,
        serialRange: `${prefix}-${from} -> ${prefix}-${to}`,
        prefix,
      } as StampGroup);

      let createStampArr = [];
      const createPromises = [];
      const batchAmount = 3000;

      for (let i = from; i <= to; i++) {
        createStampArr.push({
          publicCode: `${prefix}-${i}`,
          stampGroupId: stampGroup.id,
        } as Stamp);

        // batch create to improve performance
        if (createStampArr.length >= batchAmount || i === to) {
          const promise = transaction.save(Stamp, createStampArr);

          createPromises.push(promise);
          createStampArr = [];
        }
      }

      await Promise.all(createPromises);

      return stampGroup;
    });
  }

  async updateStampGroup(id: number, data: UpdateStampGroupDto) {
    const { name } = data;

    const [existStampGroup, existName] = await Promise.all([
      this.stampGroupRepo.findOneBy({ id }),
      this.stampGroupRepo.findOneBy({ name }),
    ]);

    if (existName) throw new ApiError('Stamp group name already exist');
    if (!existStampGroup) throw new ApiError('Stamp group not exist');

    await this.stampGroupRepo.update({ id }, { name });

    return true;
  }

  async assignStampToProduct(data: AssignStampToProductDto) {
    const { stampGroupId, productId, from, to } = data;

    return await this.entityManager.transaction(async (transaction) => {
      const activeStamp = Number(to) - Number(from) + 1;

      const [existStampGrp, existProduct] = await Promise.all([
        transaction.findOneBy(StampGroup, {
          id: stampGroupId,
        }),
        transaction.findOneBy(Product, { id: productId }),
      ]);

      if (!existStampGrp) throw new ApiError('Stamp group not exist');
      if (!existProduct) throw new ApiError('Product not exist');

      await transaction.update(StampGroup, { id: existStampGrp.id }, {
        activeStamp: Number(existStampGrp.activeStamp) + activeStamp,
      } as StampGroup);

      const updatePromises = [];
      const batchAmount = 1000;
      let batchCount = 0;

      const defaultQuery = transaction
        .createQueryBuilder()
        .update(Stamp)
        .set({ productId })
        .where({ stampGroupId: existStampGrp.id });

      let additionalConditions = ``;

      for (let i = Number(from); i <= Number(to); i++) {
        const codeQuery = `public_code = '${existStampGrp.prefix}-${i}' `;

        additionalConditions += additionalConditions.length
          ? ` or ${codeQuery}`
          : codeQuery;
        batchCount += 1;

        // batch update to improve performance
        if (batchCount >= batchAmount || i === Number(to)) {
          updatePromises.push(
            defaultQuery
              .clone()
              .andWhere(new Brackets((qb) => qb.andWhere(additionalConditions)))
              .execute(),
          );

          batchCount = 0;
          additionalConditions = ``;
        }
      }

      await Promise.all(updatePromises);

      return true;
    });
  }

  async getListStampGroup(data: ListStampGroupDto) {
    const { name, limit, page } = data;

    const skip = (page - 1) * limit;

    const query = {
      name: name ? ILike(`%${name}%`) : undefined,
    };

    const [stampGroup, total] = await Promise.all([
      this.stampGroupRepo.find({
        where: query,
        take: limit,
        skip,
        order: { updatedAt: 'DESC' },
      }),
      this.stampGroupRepo.count({
        where: query,
      }),
    ]);

    return {
      data: stampGroup,
      total,
    };
  }

  async getProductByCode(code: string) {
    const result = (await this.stampRepo
      .createQueryBuilder('st')
      .where({ publicCode: code } as Stamp)
      .innerJoinAndMapOne(
        'st.product',
        Product,
        'prd',
        'prd.id = st.product_id',
      )
      .getOne()) as Stamp & { product: Product };

    if (!result) throw new ApiError('Stamp or product not exist');

    return { code: result.publicCode, product: result.product };
  }

  private async checkPrivateCode(privateCode: string) {
    const result = (await this.stampRepo
      .createQueryBuilder('st')
      .where({ id: privateCode } as Stamp)
      .innerJoinAndMapOne(
        'st.product',
        Product,
        'prd',
        'prd.id = st.product_id',
      )
      .getOne()) as Stamp & { product: Product };

    if (!result) throw new ApiError('Stamp or product not exist');

    const gameHistory = await this.gameHistoryRepo.findOneBy({
      stampId: result.id,
    });

    return { gameHistory, stamp: result };
  }

  async checkStampPrivateCode(code: string) {
    const { gameHistory } = await this.checkPrivateCode(code);

    if (!gameHistory) return true;

    const customer = await this.customerRepo.findOneBy({
      id: gameHistory.customerId,
    });

    const maskedPhone = CommonService.maskPhoneNumber(customer.phoneNumber);

    return `This code has been used by ${maskedPhone}`;
  }

  async submitCustomerWithPrivateCode(data: SubmitPrivateCodeDto) {
    const { privateCode, name, phoneNumber, email, address, location } = data;

    const { gameHistory, stamp } = await this.checkPrivateCode(privateCode);

    if (gameHistory) throw new ApiError('This stamp already been used');

    const existCustomer = await this.customerRepo.findOneBy({ phoneNumber });

    const result = await this.entityManager.transaction(async (transaction) => {
      const prize = (await transaction
        .createQueryBuilder(GamePrize, 'gp')
        .where({ id: stamp.gamePrizeId } as GamePrize)
        .innerJoinAndMapOne(
          'gp.gameProgram',
          GameProgram,
          'gpr',
          'gpr.id = gp.gameProgramId',
        )
        .getOne()) as GamePrize & { gameProgram: GameProgram };

      if (!prize) throw new ApiError('This stamp is not assign to any prize');

      let customerData = existCustomer;

      if (existCustomer) {
        const winQuery = prize ? { winTimes: () => 'winTimes + 1' } : {};

        await transaction
          .createQueryBuilder()
          .update(Customer)
          .where({ id: existCustomer.id })
          .set({ attempts: () => 'attempts + 1', ...winQuery })
          .execute();
      } else {
        customerData = await transaction.save(Customer, {
          name,
          phoneNumber,
          email,
          address,
          location,
          attempts: 1,
          winTimes: prize ? 1 : 0,
        } as Customer);
      }

      await transaction.save(GameHistory, {
        customerId: customerData.id,
        gamePrizeId: prize.id,
        stampId: stamp.id,
      } as GameHistory);

      return prize ? prize.name : false;
    });

    return result;
  }
}
