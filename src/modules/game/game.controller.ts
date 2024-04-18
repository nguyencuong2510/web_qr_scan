import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameProgramDto } from './dtos/create-game-program.dto';
import {
  AssignPrizeToStampDto,
  CreateProgramPrizeDto,
  UpdateGameProgramDto,
  UpdateProgramPrizeDto,
} from './dtos';
import { ApiResult } from '../../common/classes';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/game')
@ApiTags('Game')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('program')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createGameProgram(@Body() data: CreateGameProgramDto) {
    const result = await this.gameService.createGameProgram(data);
    return new ApiResult().success(result);
  }

  @Post('prize')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createGameProgramPrize(@Body() data: CreateProgramPrizeDto) {
    const result = await this.gameService.createGamePrize(data);
    return new ApiResult().success(result);
  }

  @Put('program/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateGameProgram(
    @Body() data: UpdateGameProgramDto,
    @Param('id') id: string,
  ) {
    const result = await this.gameService.updateGameProgram(id, data);
    return new ApiResult().success(result);
  }

  @Put('prize/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateGameProgramPrize(
    @Body() data: UpdateProgramPrizeDto,
    @Param('id') id: string,
  ) {
    const result = await this.gameService.updateGamePrize(id, data);
    return new ApiResult().success(result);
  }

  @Put('prize/:id/assign-to-stamp')
  @UsePipes(new ValidationPipe({ transform: true }))
  async assignPrizeToStamp(
    @Body() data: AssignPrizeToStampDto,
    @Param('id') id: string,
  ) {
    const result = await this.gameService.assignPrizeToStamp(id, data);
    return new ApiResult().success(result);
  }
}