import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from '../../../common/classes';

export class GetCustomerList extends BasePaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  keyword: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsEnum(['true', 'false'])
  isWin: string;
}
