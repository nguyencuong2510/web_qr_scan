import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthController, PrivateAuthController } from './auth.controller';
import { User } from 'src/database/models';
import { AuthService } from './auth.service';
import { ConfigType } from '@nestjs/config';
import appConfig from '../../common/services/config.service';
import { JwtStrategy } from './jwt.strategy';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [appConfig.KEY],
      useFactory: async (conf: ConfigType<typeof appConfig>) => ({
        secret: conf.jwtSecret,
        signOptions: { expiresIn: conf.jwtExpireTime },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController, PrivateAuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
