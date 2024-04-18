import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGameHistoryTable1713385130161 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS "game_history" (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at timestamp default now() NOT NULL,
      updated_at timestamp default now() NOT NULL,
      game_prize_id uuid NOT NULL,
      customer_id uuid NOT NULL,
      stamp_id uuid NOT NULL,
      time_received_prize timestamp null
      );
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP TABLE IF EXISTS "game_history";
    `);
  }
}
