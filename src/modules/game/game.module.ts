import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameHistory, GamePrize, GameProgram } from '../../database/models';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([GameProgram, GamePrize, GameHistory])],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
