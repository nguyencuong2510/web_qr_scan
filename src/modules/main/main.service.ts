import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Customer,
  GameProgram,
  Stamp,
  StampGroup,
} from '../../database/models';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class MainService {
  constructor(
    @InjectRepository(StampGroup)
    private readonly stampGroupRepo: Repository<StampGroup>,
    @InjectRepository(Stamp)
    private readonly stampRepo: Repository<Stamp>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(GameProgram)
    private readonly gameProgramRepo: Repository<GameProgram>,
  ) {}

  async getMain() {
    const currentDate = new Date();
    const [noCustomers, noStamps, noStampGroups, activeProgram] =
      await Promise.all([
        this.customerRepo.count(),
        this.stampRepo.count(),
        this.stampGroupRepo.count(),
        this.gameProgramRepo.countBy({
          startTime: LessThanOrEqual(currentDate),
          endTime: MoreThanOrEqual(currentDate),
        }),
      ]);

    return {
      numberOfStampGroup: noStampGroups,
      numberOfStamp: noStamps,
      numberOfCustomer: noCustomers,
      activeProgram,
    };
  }
}
