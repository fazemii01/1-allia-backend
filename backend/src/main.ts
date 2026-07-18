import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const configService = app.get(ConfigService);
  console.log('====================================');
  console.log('NestJS Database Host:', configService.get('DATABASE_HOST', 'localhost'));
  console.log('NestJS Database Name:', configService.get('DATABASE_NAME', 'alliakids_db'));
  console.log('====================================');
  
  // Auto-run schema sync for missing mobile_image_url column in ak_banners
  try {
    const dataSource = app.get(DataSource);
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    const hasColumn = await queryRunner.hasColumn('ak_banners', 'mobile_image_url');
    if (!hasColumn) {
      console.log('Column ak_banners.mobile_image_url does not exist. Adding it dynamically...');
      await queryRunner.query('ALTER TABLE "ak_banners" ADD COLUMN "mobile_image_url" character varying(255)');
      console.log('Column mobile_image_url added successfully.');
    }
    await queryRunner.release();
  } catch (err) {
    console.warn('Auto migration warning (could be running first seed):', err.message);
  }

  // Serve static payment proofs / receipts
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
