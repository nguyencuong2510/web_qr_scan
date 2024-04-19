import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer, Stamp, StampGroup } from '../../database/models';
import { Repository } from 'typeorm';

@Injectable()
export class MainService {
  constructor(
    @InjectRepository(StampGroup)
    private readonly stampGroupRepo: Repository<StampGroup>,
    @InjectRepository(Stamp)
    private readonly stampRepo: Repository<Stamp>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async getMain() {
    const noCustomers = await this.customerRepo.count();
    const noStamps = await this.stampRepo.count();
    const noStampGroups = await this.stampGroupRepo.count();

    return {
      numberOfStampGroup: noStampGroups,
      numberOfStamp: noStamps,
      numberOfCustomer: noCustomers,
    };
  }
}
