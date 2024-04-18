import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as moment from 'moment';

@ValidatorConstraint({ name: 'validateEndTime' })
export class ValidateEndTime implements ValidatorConstraintInterface {
  validate(value: string, args: any) {
    if (moment(value).isAfter(moment(args.object.startTime))) {
      return true;
    }

    return false;
  }

  defaultMessage() {
    return 'endTime must be greater than startTime';
  }
}

export class CreateGameProgramDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
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
