import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTable1713166569054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
    CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        username varchar NULL,
        password varchar NULL,
        created_at timestamp default now() NOT NULL,
        updated_at timestamp default now() NOT NULL
    );
    `);

    // create product table
    queryRunner.query(`
    CREATE TABLE IF NOT EXISTS "product" (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        price BIGINT NULL,
        expiry INTEGER NULL,
        image TEXT[] NOT NULL DEFAULT '{}',
        anti_counterfeit_image TEXT[] NOT NULL DEFAULT '{}',
        ingredient VARCHAR NULL,
        usage VARCHAR NULL,
        preserve VARCHAR NULL,
        recommendation VARCHAR NULL,
        certification VARCHAR NULL,
        mfr_company_name VARCHAR NULL,
        mfr_company_id VARCHAR NULL,
        mfr_address VARCHAR NULL,
        mfr_website VARCHAR NULL,
        mfr_email VARCHAR NULL,
        mfr_phone VARCHAR NULL,
        shopee_link VARCHAR NULL,
        lazada_link VARCHAR NULL,
        created_at timestamp default now() NOT NULL,
        updated_at timestamp default now() NOT NULL
    );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        DROP TABLE IF EXISTS "user";
        DROP TABLE IF EXISTS "product";
    `);
  }
}
