import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStampGroupTable1713686613421 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "stamp_group"
    ADD COLUMN "active_serial_range" TEXT[] NOT NULL DEFAULT '{}';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` 
    ALTER TABLE "stamp_group"
    DROP COLUMN "active_serial_range" `);
  }
}
