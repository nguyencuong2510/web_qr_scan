import { Module } from '@nestjs/common';
import { PublicStampController, StampController } from './stamp.controller';
import { StampService } from './stamp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Customer,
  GameHistory,
  Product,
  Stamp,
  StampGroup,
} from '../../database/models';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StampGroup,
      Stamp,
      Product,
      Customer,
      GameHistory,
    ]),
  ],
  controllers: [StampController, PublicStampController],
  providers: [StampService],
  exports: [StampService],
})
export class StampModule {}
