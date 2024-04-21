import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGameHistoryTable1713705944395 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TYPE game_history_status AS ENUM ('IN_PROGRESS', 'SENT', 'RECEIVED');

    ALTER TABLE "game_history"
    ADD COLUMN "status" game_history_status NOT NULL DEFAULT 'IN_PROGRESS';

    ALTER TABLE "game_history"
    ADD COLUMN "is_played" bool default false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "game_history"
    DROP COLUMN "status";

    DROP TYPE game_history_status;

    ALTER TABLE "game_history"
    DROP COLUMN "is_played";
    `);
  }
}
