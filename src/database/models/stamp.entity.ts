import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Stamp {
  @PrimaryGeneratedColumn('uuid')
  @Index({ unique: true })
  id: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
    nullable: false,
  })
  updatedAt: Date;

  @Column({ length: 255, nullable: false, unique: true, name: 'public_code' })
  publicCode: string;

  @Column({ nullable: false, type: 'int4', name: 'stamp_group_id' })
  stampGroupId: number;

  @Column({ nullable: true, type: 'int4', name: 'product_id' })
  productId: number;

  @Column({ nullable: true, type: 'uuid', name: 'game_prize_id' })
  gamePrizeId: string;
}
