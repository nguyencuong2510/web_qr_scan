import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class AssignPrizeToStampDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  stampGroupId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  from: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  to: number;
}
