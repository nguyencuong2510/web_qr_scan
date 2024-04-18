import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  readonly oldPassword: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(256)
  readonly newPassword: string;
}
