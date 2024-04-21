import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Put,
  Param,
  UseGuards,
  Delete,
  Get,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameProgramDto } from './dtos/create-game-program.dto';
import {
  AssignPrizeToStampDto,
  CreateProgramPrizeDto,
  ListProgramDto,
  UpdateGameProgramDto,
  UpdateProgramPrizeDto,
  UpdateReceiveStatusDto,
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

  @Get('program')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listProgram(@Body() data: ListProgramDto) {
    const result = await this.gameService.listProgram(data);
    return new ApiResult().success(result);
  }

  @Get('program/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async listProgramDetail(@Param('id') id: string) {
    const result = await this.gameService.programDetail(id);
    return new ApiResult().success(result);
  }

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

  @Put('program/stop/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async stopProgram(@Param('id') id: string) {
    const result = await this.gameService.stopProgram(id);
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

  @Delete('prize/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteProduct(@Param('id') id: string) {
    const result = await this.gameService.deletePrize(id);
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

  @Get('play/:privateCode')
  @UsePipes(new ValidationPipe({ transform: true }))
  async play(@Param('privateCode') privateCode: string) {
    const result = await this.gameService.playGame(privateCode);
    return new ApiResult().success(result);
  }

  @Put('receive-status/:gameHistoryId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateReceiveStatus(
    @Body() data: UpdateReceiveStatusDto,
    @Param('gameHistoryId') gameHistoryId: string,
  ) {
    const result = await this.gameService.updateReceiveStatus(
      gameHistoryId,
      data,
    );
    return new ApiResult().success(result);
  }
}
