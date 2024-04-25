import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStampTableIndex1714033017444 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX idx_stamp_public_code
        ON "stamp" (public_code);

        CREATE INDEX idx_stamp_stamp_group_id
        ON "stamp" (stamp_group_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS  idx_stamp_public_code;
        DROP INDEX IF EXISTS  idx_stamp_stamp_group_id;
    `);
  }
}
