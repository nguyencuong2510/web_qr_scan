import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

import { BaseEntity } from '../../common/typeorm/base.entity';
import { Logger } from '@nestjs/common';

@Entity()
export class User extends BaseEntity {
  @Column({ length: 255, nullable: true, name: 'username', unique: true })
  @ApiProperty()
  username: string;

  @Column({ length: 255, nullable: true })
  @Exclude()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
      } catch (error) {
        const logger = new Logger(this.constructor.name);
        logger.error(error);
      }
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(password, this.password);
  }
}
