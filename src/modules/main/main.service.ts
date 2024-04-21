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
    const noCustomers = await this.customerRepo.count();
    const noStamps = await this.stampRepo.count();
    const noStampGroups = await this.stampGroupRepo.count();

    const currentDate = new Date();
    const activeProgram = await this.gameProgramRepo.countBy({
      startTime: LessThanOrEqual(currentDate),
      endTime: MoreThanOrEqual(currentDate),
    });

    return {
      numberOfStampGroup: noStampGroups,
      numberOfStamp: noStamps,
      numberOfCustomer: noCustomers,
      activeProgram,
    };
  }
}
