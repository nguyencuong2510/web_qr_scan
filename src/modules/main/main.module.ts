import { Module } from '@nestjs/common';
import { MainService } from './main.service';
import { MainController } from './main.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Customer,
  GameProgram,
  Stamp,
  StampGroup,
} from '../../database/models';

@Module({
  imports: [
    TypeOrmModule.forFeature([StampGroup, Stamp, Customer, GameProgram]),
  ],
  controllers: [MainController],
  providers: [MainService],
})
export class MainModule {}
