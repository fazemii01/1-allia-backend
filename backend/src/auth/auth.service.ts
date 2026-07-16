import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string; user: Partial<User> }> {
    // Check whatsapp uniqueness
    const existingWa = await this.userRepo.findOne({ where: { whatsapp: dto.whatsapp } });
    if (existingWa) throw new ConflictException('Nomor WhatsApp sudah terdaftar');

    // Check email uniqueness (if provided)
    if (dto.email) {
      const existingEmail = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existingEmail) throw new ConflictException('Email sudah terdaftar');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      name: dto.name,
      whatsapp: dto.whatsapp,
      email: dto.email ?? null,
      password_hash,
      role: 'user',
      child_name: dto.child_name,
      child_age: dto.child_age,
      child_tempat_lahir: dto.child_tempat_lahir,
      child_tanggal_lahir: dto.child_tanggal_lahir,
      child_jenis_kelamin: dto.child_jenis_kelamin,
    });

    const saved = await this.userRepo.save(user);
    const payload = { sub: saved.id, whatsapp: saved.whatsapp, email: saved.email, role: saved.role };
    const access_token = this.jwtService.sign(payload);

    const { password_hash: _, ...userWithoutPassword } = saved;
    return { access_token, user: userWithoutPassword };
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: Partial<User> }> {
    if (!dto.email && !dto.whatsapp) {
      throw new BadRequestException('Masukkan email atau nomor WhatsApp untuk login');
    }
    const user = await this.validateUser(
      dto.password,
      dto.email,
      dto.whatsapp,
    );
    const payload = { sub: user.id, whatsapp: user.whatsapp, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);
    const { password_hash: _, ...userWithoutPassword } = user;
    return { access_token, user: userWithoutPassword };
  }

  async validateUser(
    password: string,
    email?: string,
    whatsapp?: string,
  ): Promise<User> {
    // Find by email first, fall back to whatsapp
    let user: User | null = null;
    if (email) {
      user = await this.userRepo.findOne({ where: { email } });
    }
    if (!user && whatsapp) {
      user = await this.userRepo.findOne({ where: { whatsapp } });
    }
    if (!user) {
      throw new UnauthorizedException('Email/WhatsApp atau password salah');
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email/WhatsApp atau password salah');
    }
    return user;
  }

  async findById(id: number): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(id: number, data: any): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan!');
    }

    if (data.name) user.name = data.name;
    
    if (data.email) {
      if (data.email !== user.email) {
        const exist = await this.userRepo.findOneBy({ email: data.email });
        if (exist) {
          throw new BadRequestException('Email sudah digunakan!');
        }
      }
      user.email = data.email;
    }

    if (data.photo_url !== undefined) {
      user.photo_url = data.photo_url;
    }

    if (data.bio !== undefined) {
      user.bio = data.bio;
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(data.password, salt);
    }

    const saved = await this.userRepo.save(user);
    const { password_hash: _, ...userWithoutPassword } = saved;
    return userWithoutPassword;
  }
}
