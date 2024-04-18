import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './common/services/config.service';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { AuthModule } from './modules/auth/auth.module';
import { StampModule } from './modules/stamp/stamp.module';
import { CustomerModule } from './modules/customer/customer.module';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DatabaseModule,
    ProductsModule,
    AuthModule,
    StampModule,
    CustomerModule,
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
