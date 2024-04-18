import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/typeorm/base.entity';

@Entity()
export class Product extends BaseEntity {
  @Column({
    nullable: false,
    name: 'name',
    type: 'varchar',
  })
  @ApiProperty()
  name: string;

  @Column({ nullable: true, name: 'price', type: 'int8' })
  @ApiProperty()
  price: number;

  @Column({
    nullable: true,
    name: 'expiry',
    type: 'int4',
    comment: 'thời hạn sử dụng',
  })
  @ApiProperty()
  expiry: number;

  @Column('text', {
    array: true,
    nullable: true,
    name: 'image',
    default: [],
  })
  @ApiProperty()
  image: string[];

  @Column('text', {
    array: true,
    nullable: true,
    name: 'anti_counterfeit_image',
    default: [],
    comment: 'Giấy tờ chống giả ',
  })
  @ApiProperty()
  antiCounterfeitImage: string[];

  @Column({
    nullable: true,
    name: 'ingredient',
    type: 'varchar',
    comment: 'thành phần',
  })
  @ApiProperty()
  ingredient: string;

  @Column({
    nullable: true,
    name: 'usage',
    type: 'varchar',
    comment: 'cách dùng',
  })
  @ApiProperty()
  usage: string;

  @Column({
    nullable: true,
    name: 'preserve',
    type: 'varchar',
    comment: 'bảo quản',
  })
  @ApiProperty()
  preserve: string;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'khuyến cáo',
  })
  @ApiProperty()
  recommendation: string;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'chứng nhận',
  })
  @ApiProperty()
  certification: string;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'Tên công ty sản xuất',
    name: 'mfr_company_name',
  })
  @ApiProperty()
  mfrCompanyName: string;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'Mã công ty sản xuất',
    name: 'mfr_company_id',
  })
  @ApiProperty()
  mfrCompanyId: string;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'Địa chỉ nhà sản xuất',
    name: 'mfr_address',
  })
  @ApiProperty()
  mfrAddress: string;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'Trang web nhà sản xuất',
    name: 'mfr_website',
  })
  @ApiProperty()
  mfrWebsite: string;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'Email nhà sản xuất',
    name: 'mfr_email',
  })
  @ApiProperty()
  mfrEmail: string;

  @Column({
    nullable: true,
    type: 'varchar',
    comment: 'Sdt nhà sản xuất',
    name: 'mfr_phone',
  })
  @ApiProperty()
  mfrPhone: string;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'shopee_link',
  })
  @ApiProperty()
  shopeeLink: string;

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'lazada_link',
  })
  @ApiProperty()
  lazadaLink: string;
}
