import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGameHistoryTable1713698153938 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "game_history"
    ALTER COLUMN "game_prize_id" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "game_history"
    ALTER COLUMN "game_prize_id" SET NOT NULL;
    `);
  }
}
