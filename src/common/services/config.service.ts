import { Expose, Transform } from 'class-transformer';
import { DatabaseType } from 'typeorm';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { registerAsWithValidation } from '../functions';

export enum IEnv {
  PROD = 'prod',
  DEV = 'dev',
}

export class AppConfig {
  type: DatabaseType;
  host: string;
  port: string;
  username: string;
  password: string;
  dbName: string;
  env: IEnv;
  jwtSecret: string;
  jwtExpireTime: string;
  corsAllowList: string[];
  appPort: number;
}

export class EnvConfig {
  @Expose()
  @IsNotEmpty()
  DATABASE_TYPE: DatabaseType;

  @Expose()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @Expose()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  DATABASE_PORT: string;

  @Expose()
  @IsNotEmpty()
  DATABASE_USERNAME: string;

  @Expose()
  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @Expose()
  @IsNotEmpty()
  DATABASE_NAME: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(IEnv)
  APP_ENV: IEnv;

  @Expose()
  @IsNotEmpty()
  JWT_SECRET: string;

  @Expose()
  @IsNotEmpty()
  JWT_EXPIRE_TIME: string;

  @Expose()
  @IsNotEmpty()
  CORS_ALLOW_LIST: string;

  @Expose()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  PORT: number;
}

export default registerAsWithValidation(
  'app',
  EnvConfig,
  process.env,
  (config): AppConfig => ({
    type: config.DATABASE_TYPE,
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    username: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD,
    dbName: config.DATABASE_NAME,
    env: config.APP_ENV,
    jwtExpireTime: config.JWT_EXPIRE_TIME,
    jwtSecret: config.JWT_SECRET,
    corsAllowList: config.CORS_ALLOW_LIST.split(','),
    appPort: config.PORT,
  }),
);
