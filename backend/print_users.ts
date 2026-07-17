import { DataSource } from 'typeorm';
import { User } from './src/auth/entities/user.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASS ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'alliakids',
  entities: [User],
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find();
  console.log('\n=== USERS IN DATABASE ===');
  users.forEach(u => {
    console.log(`- Name: ${u.name}`);
    console.log(`  Email: ${u.email}`);
    console.log(`  WhatsApp: ${u.whatsapp}`);
    console.log(`  Role: ${u.role}`);
  });
  console.log('=========================\n');
  await AppDataSource.destroy();
}

run().catch(console.error);
