import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiError } from 'src/common/classes';

export function validateTo(obj: { from: number; to: number }) {
  const { from, to } = obj;

  if (to < from) throw new ApiError('From must be greater than to');

  if (to - from > 100000)
    throw new ApiError('Cant create group with more than 100,000 stamp');

  return to;
}

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
  @Min(0)
  from: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @Min(0)
  @Transform(({ obj }) => validateTo(obj))
  to: number;
}
