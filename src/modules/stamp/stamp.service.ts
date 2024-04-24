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
import { Brackets, EntityManager, ILike, IsNull, Repository } from 'typeorm';
import { ApiError } from '../../common/classes';
import {
  AssignStampToProductDto,
  CreateStampGroupDto,
  ListStampGroupDto,
  StampGroupDetailDto,
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
      });

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

  private async updateActiveRange(
    stampGroup: StampGroup,
    transaction: EntityManager,
  ) {
    const activeStamps = (await transaction.query(`
    SELECT public_code as "publicCode"
    FROM stamp
    WHERE product_id IS NOT NULL
    ORDER BY 
    CAST(SUBSTRING(public_code FROM '[0-9]+') AS INTEGER);
    `)) as Pick<Stamp, 'publicCode'>[];

    const activeSerialRange = [];
    let startRange = null;
    let endRange = null;

    for (const stamp of activeStamps) {
      const code = stamp.publicCode;
      const [prefix, number] = code.split('-');
      const stampNumber = parseInt(number);
      if (startRange === null) {
        startRange = stampNumber;
        endRange = stampNumber;
      } else if (stampNumber === endRange + 1) {
        endRange = stampNumber;
      } else {
        activeSerialRange.push(
          `${prefix}-${startRange} -> ${prefix}-${endRange}`,
        );
        startRange = stampNumber;
        endRange = stampNumber;
      }
    }
    if (startRange !== null && endRange !== null) {
      activeSerialRange.push(
        `${stampGroup.prefix}-${startRange} -> ${stampGroup.prefix}-${endRange}`,
      );
    }
    await transaction.update(
      StampGroup,
      { id: stampGroup.id },
      { activeSerialRange },
    );
  }

  async assignStampToProduct(data: AssignStampToProductDto) {
    const { stampGroupId, productId, from, to } = data;

    return await this.entityManager.transaction(async (transaction) => {
      const activeStamp = Number(to) - Number(from) + 1;

      const [existStampGrp, existProduct] = await Promise.all([
        transaction.findOneBy(StampGroup, {
          id: stampGroupId,
        }),
        transaction.findOneBy(Product, { id: productId, deletedAt: IsNull() }),
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
      await this.updateActiveRange(existStampGrp, transaction);

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
      .leftJoinAndMapOne(
        'st.gameHistory',
        GameHistory,
        'gh',
        'gh.stampId = st.id',
      )
      .leftJoinAndMapOne(
        'st.customer',
        Customer,
        'cus',
        'cus.id = gh.customerId',
      )
      .getOne()) as Stamp & {
      product: Product;
      gameHistory?: GameHistory;
      customer?: Customer;
    };

    if (!result) throw new ApiError('Stamp or product not exist');

    return {
      code: result.publicCode,
      product: result.product,
      isUsed: result.gameHistory ? true : false,
      usedPhoneNumber: CommonService.maskPhoneNumber(
        result?.customer?.phoneNumber || '',
      ),
    };
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
      .leftJoinAndMapOne(
        'st.gameHistory',
        GameHistory,
        'gh',
        'gh.stampId = st.id',
      )
      .leftJoinAndMapOne(
        'st.customer',
        Customer,
        'cus',
        'cus.id = gh.customerId',
      )
      .getOne()) as Stamp & {
      product: Product;
      gameHistory?: GameHistory;
      customer?: Customer;
    };

    if (!result) throw new ApiError('Stamp or product not exist');

    return {
      gameHistory: result.gameHistory,
      stamp: result,
      customer: result.customer,
      product: result.product,
    };
  }

  async checkStampPrivateCode(code: string) {
    const { gameHistory, customer, product } =
      await this.checkPrivateCode(code);

    return {
      product,
      isUsed: gameHistory ? true : false,
      usedPhoneNumber: CommonService.maskPhoneNumber(
        customer?.phoneNumber || '',
      ),
    };
  }

  async submitCustomerWithPrivateCode(data: SubmitPrivateCodeDto) {
    const { privateCode, name, phoneNumber, email, address, location } = data;

    const { gameHistory, stamp, customer } =
      await this.checkPrivateCode(privateCode);

    if (gameHistory) throw new ApiError('This stamp already been used');

    const existCustomer = customer;

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
        gamePrizeId: prize?.id,
        stampId: stamp.id,
      } as GameHistory);

      return prize || { name: 'Chúc bạn may mắn lần sau' };
    });

    return result;
  }

  async getStampList(stampGroupId: number, data: StampGroupDetailDto) {
    const { limit, page } = data;
    const skip = (page - 1) * limit;

    const group = await this.stampGroupRepo.findOneBy({ id: stampGroupId });
    if (!group) throw new ApiError('Stamp group not found');

    const stampQuery = this.stampRepo
      .createQueryBuilder('st')
      .select(`public_code as "publicCode", id`)
      .where(`st.stamp_group_id = :stampGroupId `, { stampGroupId });

    const [stamps, total] = await Promise.all([
      stampQuery
        .orderBy(`CAST(SUBSTRING(st.public_code FROM '[0-9]+') AS INTEGER)`)
        .take(limit)
        .skip(skip)
        .getRawMany(),
      stampQuery.getCount(),
    ]);

    return {
      id: group.id,
      name: group.name,
      stamps: { data: stamps, total },
    };
  }
}
