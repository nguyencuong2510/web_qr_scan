import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from '../../../common/classes';

export class ListStampGroupDto extends BasePaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
