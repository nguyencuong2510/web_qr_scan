import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Validate } from 'class-validator';
import { ValidateEndTime } from './create-game-program.dto';

export class UpdateGameProgramDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Validate(ValidateEndTime, {
    message: 'endTime must be greater than startTime',
  })
  endTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rules: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  backgroundImage: string;
}
