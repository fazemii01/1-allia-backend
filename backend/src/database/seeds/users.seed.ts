import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../auth/entities/user.entity';

interface UserSeed {
  name: string;
  whatsapp: string;
  email: string;
  password: string;
  role: string;
}

const USERS: UserSeed[] = [
  {
    name: 'Administrator Allia',
    whatsapp: '08100000001',
    email: 'admin@alliago.id',
    password: 'Admin@1234',
    role: 'admin',
  },
  {
    name: 'Staff Allia Kids',
    whatsapp: '08100000002',
    email: 'staff@alliago.id',
    password: 'Staff@1234',
    role: 'staff',
  },
  {
    name: 'Budi Santoso (Demo Parent)',
    whatsapp: '08100000003',
    email: 'user@alliago.id',
    password: 'User@1234',
    role: 'user',
  },
];

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);

  console.log('\n📦 Seeding Users...');

  for (const u of USERS) {
    const existingEmail = await userRepo.findOne({ where: { email: u.email } });
    const existingWa = await userRepo.findOne({ where: { whatsapp: u.whatsapp } });

    if (existingEmail || existingWa) {
      console.log(`  ⏭️  User "${u.email}" (${u.role}) already exists`);
      continue;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(u.password, salt);

    await userRepo.save(
      userRepo.create({
        name: u.name,
        whatsapp: u.whatsapp,
        email: u.email,
        password_hash,
        role: u.role,
      }),
    );

    console.log(`  ✅ Created ${u.role}: ${u.email} (password: ${u.password})`);
  }
}
