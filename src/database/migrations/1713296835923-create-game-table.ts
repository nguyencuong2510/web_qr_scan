import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGameTable1713296835923 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "game_program" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at timestamp default now() NOT NULL,
        updated_at timestamp default now() NOT NULL,
        name varchar NOT NULL,
        start_time timestamp NOT NULL,
        end_time timestamp NOT NULL,
        background_image varchar NULL,
        rules varchar NULL
        );
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "game_prize" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at timestamp default now() NOT NULL,
        updated_at timestamp default now() NOT NULL,
        name varchar NOT NULL,
        image varchar NULL,
        value varchar NULL,
        game_program_id uuid null
        );
    `);

    await queryRunner.query(`
        ALTER TABLE "stamp"
        ADD COLUMN "game_prize_id" uuid null;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP TABLE IF EXISTS "game_program";
    DROP TABLE IF EXISTS "game_prize";

    ALTER TABLE "stamp"
    DROP COLUMN "game_prize_id";
  `);
  }
}
