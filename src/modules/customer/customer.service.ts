import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Customer,
  GameHistory,
  GamePrize,
  GameProgram,
} from '../../database/models';
import { Brackets, Repository } from 'typeorm';
import { GetCustomerList } from './dtos';

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

  async getCustomerDetail(customerId: string) {
    const customer = await this.customerRepo.findOneBy({ id: customerId });

    const history = (await this.gameHistoryRepo
      .createQueryBuilder('gh')
      .where({ customerId } as GameHistory)
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
      .getMany()) as (GameHistory & {
      program: GameProgram;
      prize?: GamePrize;
    })[];

    return {
      customer,
      history: history.map((v) => ({
        name: v?.prize?.name || 'Chúc bạn may mắn lần sau',
        program: v?.program?.name || '',
        isReceived: v.timeReceivedPrize ? true : false,
        timeReceivedPrize: v.timeReceivedPrize,
      })),
    };
  }
}
