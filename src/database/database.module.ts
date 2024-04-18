import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigType } from '@nestjs/config';
import appConfig from '../common/services/config.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      useFactory: async (databaseConf: ConfigType<typeof appConfig>) => ({
        type: 'postgres',
        host: databaseConf.host,
        port: Number(databaseConf.port),
        username: databaseConf.username,
        password: databaseConf.password,
        database: databaseConf.dbName,
        autoLoadEntities: true,
        migrations: [__dirname + '/**/migrations/*{.ts,.js}'],
        extra: {
          max: 30,
          charset: 'utf8mb4_unicode_ci',
        },
        synchronize: false,
        logging: false,
        poolSize: 20,
      }),
      inject: [appConfig.KEY],
    }),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
