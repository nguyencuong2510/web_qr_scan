import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GameStatusEnum {
  'IN_PROGRESS' = 'IN_PROGRESS',
  'SENT' = 'SENT',
  'RECEIVED' = 'RECEIVED',
}

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

  @Column({
    nullable: false,
    name: 'status',
    type: 'enum',
    enum: GameStatusEnum,
  })
  status: string;

  @Column({
    nullable: false,
    name: 'is_played',
    type: 'bool',
    default: false,
  })
  isPlayed: boolean;
}
