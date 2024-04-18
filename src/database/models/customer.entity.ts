import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Customer {
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

  @Column({ length: 255, nullable: false, unique: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true, name: 'email' })
  email: string;

  @Column({ nullable: true, name: 'location' })
  location: string;

  @Column({ nullable: true, name: 'address' })
  address: string;

  @Column({ nullable: true, type: 'int4', name: 'attempts', default: 0 })
  attempts: number;

  @Column({ nullable: true, type: 'int4', name: 'win_times', default: 0 })
  winTimes: number;
}
