import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  GamePrize,
  GameProgram,
  Stamp,
  StampGroup,
} from '../../database/models';
import { Brackets, EntityManager, Repository } from 'typeorm';
import {
  AssignPrizeToStampDto,
  CreateGameProgramDto,
  CreateProgramPrizeDto,
  UpdateGameProgramDto,
  UpdateProgramPrizeDto,
} from './dtos';
import { ApiError } from 'src/common/classes';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameProgram)
    private readonly gameProgramRepo: Repository<GameProgram>,

    @InjectRepository(GamePrize)
    private readonly gamePrizeRepo: Repository<GamePrize>,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async createGameProgram(data: CreateGameProgramDto) {
    return await this.gameProgramRepo.save(data);
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
      this.gamePrizeRepo.countBy({ gameProgramId }),
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
      });

      if (gamePrizes >= 6) throw new ApiError(`Program max prize is 6`);
    }

    return await this.gamePrizeRepo.save({
      id,
      ...data,
      updatedAt: new Date(),
    });
  }

  async assignPrizeToStamp(prizeId: string, data: AssignPrizeToStampDto) {
    const { stampGroupId, from, to } = data;

    return await this.entityManager.transaction(async (transaction) => {
      const [existStampGrp, existPrize] = await Promise.all([
        transaction.findOneBy(StampGroup, {
          id: stampGroupId,
        }),
        transaction.findOneBy(GamePrize, { id: prizeId }),
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

      let additionalConditions = ``;

      for (let i = Number(from); i <= Number(to); i++) {
        const codeQuery = `public_code = '${existStampGrp.prefix}-${i}' `;

        additionalConditions += additionalConditions.length
          ? ` or ${codeQuery}`
          : codeQuery;
        batchCount += 1;

        // batch update to improve performance
        if (batchCount >= batchAmount || i === Number(to)) {
          checkExistPromise.push(
            builder
              .clone()
              .andWhere(`game_prize_id is null`)
              .andWhere(new Brackets((qb) => qb.andWhere(additionalConditions)))
              .getCount(),
          );

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
}
