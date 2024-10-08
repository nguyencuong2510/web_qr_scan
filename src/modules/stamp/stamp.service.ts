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
        serialRange: `KL-${from} -> KL-${to}`,
        prefix,
      } as StampGroup);

      let createStampArr = [];
      const createPromises = [];
      const batchAmount = 3000;

      for (let i = from; i <= to; i++) {
        createStampArr.push({
          publicCode: i,
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
    WHERE product_id IS NOT NULL and stamp_group_id = '${stampGroup.id}'
    ORDER BY public_code ASC;
    `)) as Pick<Stamp, 'publicCode'>[];

    const activeSerialRange = [];
    let startRange = null;
    let endRange = null;
    const prefix = 'KL';

    for (const stamp of activeStamps) {
      const stampNumber = Number(stamp.publicCode);
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
        `${prefix}-${startRange} -> ${prefix}-${endRange}`,
      );
    }
    await transaction.update(
      StampGroup,
      { id: stampGroup.id },
      { activeSerialRange },
    );
  }

  private extractRange(range: string) {
    const parts = range.split('->').map((part) => part.trim());
    const prefixAndFrom = parts[0].split('-');
    const prefixAndTo = parts[1].split('-');

    const groupFrom = Number(prefixAndFrom[1]);
    const groupTo = Number(prefixAndTo[1]);

    return { groupFrom, groupTo };
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

      const { groupFrom, groupTo } = this.extractRange(
        existStampGrp.serialRange,
      );

      if (groupFrom > Number(from) || groupTo < Number(to)) {
        throw new ApiError(
          `Range should be between ${groupFrom} -> ${groupTo}`,
        );
      }

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

      let publicCodeQuery = [];

      for (let i = Number(from); i <= Number(to); i++) {
        publicCodeQuery.push(i);
        batchCount += 1;

        // batch update to improve performance
        if (batchCount >= batchAmount || i === Number(to)) {
          updatePromises.push(
            defaultQuery
              .clone()
              .andWhere(
                new Brackets((qb) =>
                  qb.andWhere(`public_code In(:...ids)`, {
                    ids: publicCodeQuery,
                  }),
                ),
              )
              .execute(),
          );

          batchCount = 0;
          publicCodeQuery = [];
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

  async getProductByCode(groupId: number, publicCode: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, code] = publicCode.split('-');

    const result = (await this.stampRepo
      .createQueryBuilder('st')
      .where({ publicCode: Number(code), stampGroupId: groupId })
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

    const { gameHistory, stamp } = await this.checkPrivateCode(privateCode);

    if (gameHistory) {
      if (gameHistory.isPlayed) throw new ApiError('Tem đã được sử dụng');

      const prize = await this.entityManager.findOneBy(GamePrize, {
        id: gameHistory.gamePrizeId,
      });

      if (!prize)
        throw new ApiError('Tem đã hết hạn hoặc chương trình đã kết thúc');

      const prizePool = await this.entityManager
        .createQueryBuilder(GamePrize, 'gp')
        .where({
          gameProgramId: prize.gameProgramId,
          deletedAt: IsNull(),
        })
        .getMany();

      return { prize, prizePool };
    }

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

      if (!prize) {
        throw new ApiError('Tem đã hết hạn hoặc chương trình đã kết thúc');
      }

      const prizePool = await transaction
        .createQueryBuilder(GamePrize, 'gp')
        .where({
          gameProgramId: prize.gameProgramId,
          deletedAt: IsNull(),
        })
        .getMany();

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

      return { prize, prizePool };
    });

    return result;
  }

  async getStampList(stampGroupId: number) {
    const group = await this.stampGroupRepo.findOneBy({ id: stampGroupId });
    if (!group) throw new ApiError('Stamp group not found');

    const stampQuery = this.stampRepo
      .createQueryBuilder('st')
      .select(`CONCAT('KL-',"public_code") as publicCode, id`)
      .where(`st.stamp_group_id = :stampGroupId `, { stampGroupId });

    const [stamps, total] = await Promise.all([
      stampQuery.orderBy(`st.public_code`, 'ASC').getRawMany(),
      stampQuery.getCount(),
    ]);

    return {
      id: group.id,
      name: group.name,
      stamps: { data: stamps, total },
    };
  }

  async playGame(stampId: string) {
    const gameHistory = await this.gameHistoryRepo.findOneBy({
      stampId,
      isPlayed: false,
    });
    if (!gameHistory) throw new ApiError('Invalid private code');

    await this.gameHistoryRepo.update(
      { id: gameHistory.id },
      { isPlayed: true },
    );

    return true;
  }
}
