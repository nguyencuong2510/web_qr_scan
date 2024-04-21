import { ApiProperty } from '@nestjs/swagger';
import { GameStatusEnum } from '../../../database/models';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateReceiveStatusDto {
  @ApiProperty({ required: true, enum: GameStatusEnum })
  @IsNotEmpty()
  @IsString()
  @IsEnum(GameStatusEnum)
  status: string;
}
