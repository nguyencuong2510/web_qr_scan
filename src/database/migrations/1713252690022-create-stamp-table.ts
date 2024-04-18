import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStampTable1713252690022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stamp_group" (
        id SERIAL PRIMARY KEY,
        name varchar NOT NULL,
        amount_stamp int4 NOT NULL,
        serial_range varchar NOT NULL,
        active_stamp int4 NOT NULL DEFAULT 0,
        prefix varchar NOT NULL,
        created_at timestamp default now() NOT NULL,
        updated_at timestamp default now() NOT NULL
      );

      ALTER TABLE "stamp_group"
      ADD CONSTRAINT unique_stamp_group_name UNIQUE ("name");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stamp" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        public_code varchar NOT NULL,
        stamp_group_id int4 NOT NULL,
        product_id int4 NULL,
        created_at timestamp default now() NOT NULL,
        updated_at timestamp default now() NOT NULL
      );

      ALTER TABLE "stamp"
      ADD CONSTRAINT unique_stamp_public_code UNIQUE ("public_code");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "stamp_group";
      DROP TABLE IF EXISTS "stamp";
    `);
  }
}
