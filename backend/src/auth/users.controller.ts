import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import * as bcrypt from 'bcrypt';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    const qb = this.userRepo.createQueryBuilder('user')
      .orderBy('user.created_at', 'DESC');

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (search) {
      qb.andWhere(
        '(user.name ILIKE :search OR user.whatsapp ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const users = await qb.getMany();
    return users.map(u => {
      const { password_hash, ...rest } = u;
      return rest;
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User tidak ditemukan!');
    }
    const { password_hash, ...rest } = user;
    return rest;
  }

  @Post()
  async create(@Body() body: any) {
    const { name, whatsapp, email, password, role } = body;
    if (!name || !whatsapp || !password || !role) {
      throw new BadRequestException('Nama, WhatsApp, password, dan role wajib diisi!');
    }

    const existingWa = await this.userRepo.findOneBy({ whatsapp });
    if (existingWa) {
      throw new BadRequestException('Nomor WhatsApp sudah terdaftar!');
    }

    if (email) {
      const existingEmail = await this.userRepo.findOneBy({ email });
      if (existingEmail) {
        throw new BadRequestException('Email sudah terdaftar!');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = this.userRepo.create({
      name,
      whatsapp,
      email: email || null,
      password_hash: passwordHash,
      role,
      child_name: body.child_name || null,
      child_age: body.child_age || null,
      child_tempat_lahir: body.child_tempat_lahir || null,
      child_tanggal_lahir: body.child_tanggal_lahir || null,
      child_jenis_kelamin: body.child_jenis_kelamin || null,
    });

    const saved = await this.userRepo.save(newUser);
    const { password_hash, ...rest } = saved;
    return rest;
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User tidak ditemukan!');
    }

    const { name, whatsapp, email, password, role } = body;

    if (whatsapp && whatsapp !== user.whatsapp) {
      const existingWa = await this.userRepo.findOneBy({ whatsapp });
      if (existingWa) {
        throw new BadRequestException('Nomor WhatsApp sudah digunakan user lain!');
      }
      user.whatsapp = whatsapp;
    }

    if (email && email !== user.email) {
      const existingEmail = await this.userRepo.findOneBy({ email });
      if (existingEmail) {
        throw new BadRequestException('Email sudah digunakan user lain!');
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password, salt);
    }

    if ('child_name' in body) user.child_name = body.child_name;
    if ('child_age' in body) user.child_age = body.child_age;
    if ('child_tempat_lahir' in body) user.child_tempat_lahir = body.child_tempat_lahir;
    if ('child_tanggal_lahir' in body) user.child_tanggal_lahir = body.child_tanggal_lahir;
    if ('child_jenis_kelamin' in body) user.child_jenis_kelamin = body.child_jenis_kelamin;

    const saved = await this.userRepo.save(user);
    const { password_hash, ...rest } = saved;
    return rest;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User tidak ditemukan!');
    }
    await this.userRepo.remove(user);
    return { success: true, message: 'User berhasil dihapus' };
  }
}
