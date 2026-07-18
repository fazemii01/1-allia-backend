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
  
  // Ensure mobile_image_url column exists in ak_banners table
  // Using IF NOT EXISTS so this is safe to run on every startup
  try {
    const dataSource = app.get(DataSource);
    await dataSource.query(
      'ALTER TABLE "ak_banners" ADD COLUMN IF NOT EXISTS "mobile_image_url" character varying(255) NULL'
    );
    console.log('Schema ensured: ak_banners.mobile_image_url column is present');

    // Ensure promo columns exist in ak_layanan table
    await dataSource.query(
      'ALTER TABLE "ak_layanan" ADD COLUMN IF NOT EXISTS "promo_active" boolean DEFAULT false'
    );
    await dataSource.query(
      'ALTER TABLE "ak_layanan" ADD COLUMN IF NOT EXISTS "promo_label" character varying(100) NULL'
    );
    await dataSource.query(
      'ALTER TABLE "ak_layanan" ADD COLUMN IF NOT EXISTS "promo_price" character varying(100) NULL'
    );
    await dataSource.query(
      'ALTER TABLE "ak_layanan" ADD COLUMN IF NOT EXISTS "promo_ends_at" timestamp with time zone NULL'
    );
    console.log('Schema ensured: ak_layanan promo columns are present');
  } catch (err) {
    console.warn('Schema migration warning:', err.message);
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

  // Re-verify the column 5 seconds after startup to detect if another process drops it
  setTimeout(async () => {
    try {
      const dataSource = app.get(DataSource);
      const result = await dataSource.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'ak_banners' AND column_name = 'mobile_image_url'
      `);
      if (result.length === 0) {
        console.error('CRITICAL: mobile_image_url column was DROPPED after startup! Re-adding it...');
        await dataSource.query('ALTER TABLE "ak_banners" ADD COLUMN IF NOT EXISTS "mobile_image_url" character varying(255) NULL');
        console.log('Column re-added successfully.');
      } else {
        console.log('Post-startup check OK: mobile_image_url column still exists.');
      }
    } catch (e) {
      console.warn('Post-startup check error:', e.message);
    }
  }, 5000);
}
bootstrap();
