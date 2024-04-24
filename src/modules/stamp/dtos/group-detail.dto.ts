import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from '../../../common/classes';

export class StampGroupDetailDto extends BasePaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
