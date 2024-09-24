import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateUser1713228709692 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Nhatthaitra2023@.@', salt);

    await queryRunner.query(`
        INSERT INTO "user" (username, password) VALUES ('admin', '${hash}');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(``);
  }
}
