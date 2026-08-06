import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // ✅ CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
      'http://localhost:4174',
      'http://localhost:3000',
      ...configuredOrigins,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // acceso desde celular/red local
      /^http:\/\/100\.\d+\.\d+\.\d+:\d+$/, // acceso vía Tailscale
      /^https:\/\/.*\.ts\.net$/, // acceso vía Tailscale HTTPS (tailscale serve)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // ✅ ValidationPipe con transformación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`🌐 Accesible en red local en http://192.168.100.64:${port}`);
}
bootstrap();
