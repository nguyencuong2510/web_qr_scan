import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  expiry: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  antiCounterfeitImage: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  ingredient: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  usage: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  preserve: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  recommendation: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  certification: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mfrCompanyName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mfrCompanyId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mfrAddress: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mfrWebsite: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mfrEmail: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mfrPhone: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  shopeeLink: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lazadaLink: string;
}
