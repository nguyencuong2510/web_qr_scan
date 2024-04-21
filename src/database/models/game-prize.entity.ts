import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'game_prize' })
export class GamePrize {
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

  @Column({ nullable: false, name: 'name' })
  name: string;

  @Column({ nullable: true, name: 'image' })
  image: string;

  @Column({ nullable: true, name: 'value' })
  value: string;

  @Column({ nullable: false, name: 'game_program_id' })
  gameProgramId: string;

  @Column({
    nullable: true,
    type: 'timestamp',
    name: 'deleted_at',
  })
  @ApiProperty()
  deletedAt: Date;
}
