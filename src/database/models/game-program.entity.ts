import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'game_program' })
export class GameProgram {
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

  @Column({
    type: 'timestamp',
    name: 'start_time',
    nullable: false,
  })
  startTime: Date;

  @Column({
    type: 'timestamp',
    name: 'end_time',
    nullable: false,
  })
  endTime: Date;

  @Column({ nullable: true, name: 'rules' })
  rules: string;

  @Column({ nullable: true, name: 'background_image' })
  backgroundImage: string;
}
