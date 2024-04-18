import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStampGroupDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;
}
