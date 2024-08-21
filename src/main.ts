import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import appConfig from './common/services/config.service';
import { ConfigType } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const cfg: ConfigType<typeof appConfig> = appConfig();

  if (cfg.env === 'dev') {
    const options = new DocumentBuilder()
      .setTitle('Nhat Thai Tra API Docs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  app.enableCors({
    methods: ['POST', 'PUT', 'GET', 'DELETE'],
    origin: cfg.corsAllowList,
  });

  await app.listen(cfg.appPort || 3000, '0.0.0.0');
}
bootstrap();
