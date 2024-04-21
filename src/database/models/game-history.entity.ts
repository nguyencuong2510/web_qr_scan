import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'game_history' })
export class GameHistory {
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

  @Column({ nullable: true, name: 'game_prize_id' })
  gamePrizeId: string;

  @Column({ nullable: false, name: 'customer_id' })
  customerId: string;

  @Column({ nullable: false, name: 'stamp_id' })
  stampId: string;

  @Column({ nullable: true, name: 'time_received_prize', type: 'timestamp' })
  timeReceivedPrize: Date;
}
