import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStampGroupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  prefix: string;

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
