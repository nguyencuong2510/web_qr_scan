import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTablePrizeProduct1713695372340
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "product"
    ADD COLUMN deleted_at TIMESTAMP NULL;

    ALTER TABLE "game_prize"
    ADD COLUMN deleted_at TIMESTAMP NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "product"
    DROP COLUMN deleted_at;

    ALTER TABLE "game_prize"
    DROP COLUMN deleted_at;
    `);
  }
}
