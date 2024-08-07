import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Customer,
  GameHistory,
  GamePrize,
  GameProgram,
} from '../../database/models';
import { Brackets, Repository } from 'typeorm';
import { GetCustomerList, GetGameHistoryListDto } from './dtos';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(GameHistory)
    private readonly gameHistoryRepo: Repository<GameHistory>,
  ) {}

  async getCustomersList(data: GetCustomerList) {
    const { limit, page, keyword } = data;

    const isWin = data.isWin === 'true' ? true : false;
    const skip = (page - 1) * limit;

    const queryBuilder = this.customerRepo.createQueryBuilder('cus');

    if (isWin) {
      queryBuilder.where(`win_times > 0`);
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) =>
          qb.andWhere(
            `name ILike :keyword or phone_number ILike :keyword or email ILike :keyword or id::text ILike :keyword`,
            {
              keyword: `%${keyword}%`,
            },
          ),
        ),
      );
    }

    const [customer, total] = await Promise.all([
      queryBuilder
        .clone()
        .take(limit)
        .skip(skip)
        .orderBy('updated_at', 'DESC')
        .getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      data: customer,
      total,
    };
  }

  async getCustomerDetail(customerId: string, data: GetGameHistoryListDto) {
    const { limit, page } = data;

    const skip = (page - 1) * limit;

    const customer = await this.customerRepo.findOneBy({ id: customerId });

    const historyQuery = this.gameHistoryRepo
      .createQueryBuilder('gh')
      .where({ customerId } as GameHistory);

    const history = (await historyQuery
      .leftJoinAndMapOne(
        'gh.prize',
        GamePrize,
        'gpr',
        'gpr.id = gh.game_prize_id',
      )
      .leftJoinAndMapOne(
        'gh.program',
        GameProgram,
        'prg',
        'prg.id = gpr."game_program_id"',
      )
      .limit(limit)
      .skip(skip)
      .getMany()) as (GameHistory & {
      program: GameProgram;
      prize?: GamePrize;
    })[];

    const total = await historyQuery.getCount();

    return {
      customer,
      history: {
        data: history.map((v) => ({
          id: v.id,
          name: v?.prize?.name || 'Chúc bạn may mắn lần sau',
          program: v?.program?.name || '',
          status: v.status,
          isPlayed: v.isPlayed,
          timeReceivedPrize: v.timeReceivedPrize,
          updatedAt: v.updatedAt,
          createdAt: v.createdAt,
        })),
        total,
      },
    };
  }
}
