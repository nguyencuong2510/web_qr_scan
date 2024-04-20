import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from '../../../common/classes';

export class GetListProductDto extends BasePaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name: string;
}
