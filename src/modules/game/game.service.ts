import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  GameHistory,
  GamePrize,
  GameProgram,
  Stamp,
  StampGroup,
} from '../../database/models';
import { Brackets, EntityManager, IsNull, Repository } from 'typeorm';
import {
  AssignPrizeToStampDto,
  CreateGameProgramDto,
  CreateProgramPrizeDto,
  ListProgramDto,
  UpdateGameProgramDto,
  UpdateProgramPrizeDto,
  UpdateReceiveStatusDto,
} from './dtos';
import { ApiError } from '../../common/classes';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameProgram)
    private readonly gameProgramRepo: Repository<GameProgram>,

    @InjectRepository(GamePrize)
    private readonly gamePrizeRepo: Repository<GamePrize>,

    @InjectRepository(GameHistory)
    private readonly gameHistoryRepo: Repository<GameHistory>,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async listProgram(data: ListProgramDto) {
    const { limit, page } = data;

    const skip = (page - 1) * limit;

    const [program, total] = await Promise.all([
      this.gameProgramRepo.find({
        take: limit,
        skip,
        order: { updatedAt: 'DESC' },
      }),
      this.gameProgramRepo.count({}),
    ]);

    return {
      data: program.map((v) => ({
        ...v,
        isStop:
          v.startTime >= new Date() && v.endTime <= new Date() ? false : true,
      })),
      total,
    };
  }

  async programDetail(id: string) {
    const details = await this.gameProgramRepo
      .createQueryBuilder('gp')
      .leftJoinAndMapMany(
        'gp.gamePrize',
        GamePrize,
        'pri',
        'pri.gameProgramId = gp.id',
      )
      .where('gp.id = :id', { id })
      .getOne();

    return details;
  }

  async createGameProgram(data: CreateGameProgramDto) {
    return await this.gameProgramRepo.save(data);
  }

  async stopProgram(id: string) {
    await this.gameProgramRepo.update({ id }, { endTime: new Date() });
    return true;
  }

  async updateGameProgram(id: string, data: UpdateGameProgramDto) {
    const existGameProgram = await this.gameProgramRepo.findOneBy({ id });

    if (!existGameProgram) throw new ApiError('Game program does not exist');

    return await this.gameProgramRepo.save({
      id,
      ...data,
      updatedAt: new Date(),
    });
  }

  async createGamePrize(obj: CreateProgramPrizeDto) {
    const { gameProgramId } = obj;

    const [existGameProgram, gamePrizes] = await Promise.all([
      this.gameProgramRepo.findOneBy({
        id: gameProgramId,
      }),
      this.gamePrizeRepo.countBy({ gameProgramId, deletedAt: IsNull() }),
    ]);

    if (!existGameProgram) throw new ApiError('Game program does not exist');
    if (gamePrizes >= 6) throw new ApiError(`Program max prize is 6`);

    return await this.gamePrizeRepo.save(obj);
  }

  async updateGamePrize(id: string, data: UpdateProgramPrizeDto) {
    const existPrize = await this.gamePrizeRepo.findOneBy({ id });
    if (!existPrize) throw new ApiError('Prize not exist');

    if (data.gameProgramId && existPrize.gameProgramId !== data.gameProgramId) {
      const gamePrizes = await this.gamePrizeRepo.countBy({
        gameProgramId: data.gameProgramId,
        deletedAt: IsNull(),
      });

      if (gamePrizes >= 6) throw new ApiError(`Program max prize is 6`);
    }

    return await this.gamePrizeRepo.save({
      id,
      ...data,
      updatedAt: new Date(),
    });
  }

  async deletePrize(id: string) {
    const product = await this.gamePrizeRepo.findOneBy({ id });
    if (!product) {
      throw new ApiError('Product not found');
    }
    return await this.gamePrizeRepo.update(
      { id: product.id },
      { deletedAt: new Date() },
    );
  }

  async assignPrizeToStamp(prizeId: string, data: AssignPrizeToStampDto) {
    const { stampGroupId, from, to } = data;

    return await this.entityManager.transaction(async (transaction) => {
      const [existStampGrp, existPrize] = await Promise.all([
        transaction.findOneBy(StampGroup, {
          id: stampGroupId,
        }),
        transaction.findOneBy(GamePrize, { id: prizeId, deletedAt: IsNull() }),
      ]);

      if (!existStampGrp) throw new ApiError('Stamp group not exist');
      if (!existPrize) throw new ApiError('Game prize not exist');

      const updatePromises = [];
      const checkExistPromise = [];
      const batchAmount = 1000;
      let batchCount = 0;

      const builder = transaction
        .createQueryBuilder(Stamp, 's')
        .where({ stampGroupId: existStampGrp.id });

      const defaultQuery = transaction
        .createQueryBuilder()
        .update(Stamp)
        .set({ gamePrizeId: prizeId } as Stamp)
        .where({ stampGroupId: existStampGrp.id });

      let pubCodeQuery = [];

      for (let i = Number(from); i <= Number(to); i++) {
        pubCodeQuery.push(i);
        batchCount += 1;

        // batch update to improve performance
        if (batchCount >= batchAmount || i === Number(to)) {
          checkExistPromise.push(
            builder
              .clone()
              .andWhere(`game_prize_id is null`)
              .andWhere(
                new Brackets((qb) =>
                  qb.andWhere(`public_code In(:...ids)`, { ids: pubCodeQuery }),
                ),
              )
              .getCount(),
          );

          updatePromises.push(
            defaultQuery
              .clone()
              .andWhere(
                new Brackets((qb) =>
                  qb.andWhere(`public_code In(:...ids)`, { ids: pubCodeQuery }),
                ),
              )
              .execute(),
          );

          batchCount = 0;
          pubCodeQuery = [];
        }
      }

      const checkPromiseCount = await Promise.all(checkExistPromise);
      let totalStamp = 0;
      for (const i of checkPromiseCount) {
        totalStamp += i;
      }

      if (totalStamp < to - from + 1)
        throw new ApiError('Some stamp has already assign to prize');

      await Promise.all(updatePromises);

      return true;
    });
  }

  async updateReceiveStatus(id: string, data: UpdateReceiveStatusDto) {
    const gameHistory = await this.gameHistoryRepo.findOneBy({ id });
    if (!gameHistory) throw new ApiError('Game history not found');

    await this.gameHistoryRepo.update(
      { id: gameHistory.id },
      { status: data.status },
    );

    return true;
  }
}
