import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SocketAdapter } from './socketAdapter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }));
    app.use(cookieParser());
    app.useWebSocketAdapter(new SocketAdapter(app))
    await app.listen(new ConfigService().get("PORT"), new ConfigService().get("ADDRESS"));
}
bootstrap();
