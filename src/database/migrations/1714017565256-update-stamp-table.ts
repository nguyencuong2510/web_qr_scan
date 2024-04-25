import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStampTable1714017565256 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    TRUNCATE TABLE "stamp_group";
    TRUNCATE TABLE "stamp";

    ALTER TABLE "stamp"
    DROP CONSTRAINT "unique_stamp_public_code";
    `);

    await queryRunner.query(`
    ALTER TABLE "stamp"
    ALTER COLUMN "public_code" TYPE INT4
    USING public_code::INT4;
    `);

    await queryRunner.query(`
    ALTER TABLE "stamp"
    ADD CONSTRAINT unique_stamp_public_code_and_group UNIQUE ("public_code", "stamp_group_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "stamp"
    ALTER COLUMN "public_code" TYPE INT;
    `);
  }
}
