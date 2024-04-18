import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { ConfigType } from '@nestjs/config';
import appConfig from '../common/services/config.service';

process.env.NODE_ENV == 'local'
  ? dotenv.config({ path: './.env' })
  : dotenv.config();

const databaseCfg: ConfigType<typeof appConfig> = appConfig();

export const AppDataSource = new DataSource({
  type: databaseCfg.type,
  host: databaseCfg.host,
  port: parseInt(databaseCfg.port, 10),
  username: databaseCfg.username,
  database: databaseCfg.dbName,
  password: databaseCfg.password,
  entities: [join(__dirname + '/**/models/*.entity{.ts,.js}')],
  migrations: [__dirname + '/**/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/database/migrations',
  },
  synchronize: false,
  logging: false,
  migrationsRun: false,
} as DataSourceOptions);
