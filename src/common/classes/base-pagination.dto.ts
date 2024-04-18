import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class BasePaginationDto {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit: number = 10;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page: number = 1;
}
