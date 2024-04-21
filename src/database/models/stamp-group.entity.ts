import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/typeorm/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'stamp_group' })
export class StampGroup extends BaseEntity {
  @Column({ length: 255, nullable: true, unique: true })
  name: string;

  @Column({ nullable: false, type: 'int4', default: 0, name: 'amount_stamp' })
  amountStamp: number;

  @Column({ nullable: false, type: 'int4', default: 0, name: 'active_stamp' })
  activeStamp: number;

  @Column({ nullable: false, type: 'varchar', name: 'serial_range' })
  serialRange: string;

  @Column({ nullable: false, type: 'varchar', name: 'prefix' })
  prefix: string;

  @Column('text', {
    array: true,
    nullable: true,
    name: 'active_serial_range',
    default: [],
  })
  @ApiProperty()
  activeSerialRange?: string[];
}
