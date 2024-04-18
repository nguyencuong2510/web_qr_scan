import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerTable1713266940155 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customer" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at timestamp default now() NOT NULL,
        updated_at timestamp default now() NOT NULL,
        name varchar NULL,
        phone_number varchar NOT NULL,
        email varchar NULL,
        address varchar NULL,
        location varchar NULL,
        attempts INT4 NOT NULL DEFAULT 0,
        win_times INT4 NULL DEFAULT 0
      );


      ALTER TABLE "customer"
      ADD CONSTRAINT unique_customer_phone_number UNIQUE ("phone_number");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "customer";
    `);
  }
}
