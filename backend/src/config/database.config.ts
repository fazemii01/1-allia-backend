import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASS || 'postgres',
    database: process.env.DATABASE_NAME || 'alliakids_db',
    autoLoadEntities: true,
    synchronize: true, // dev only — disable in production
    logging: process.env.NODE_ENV === 'development',
  }),
);
