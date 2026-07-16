import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { LayananService } from './layanan.service';
import { CreateLayananDto, CreateLayananCategoryDto } from './dto/create-layanan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ── Public endpoints (no auth) ────────────────────────────────────────
@Controller('layanan')
export class LayananPublicController {
  constructor(private readonly layananService: LayananService) {}

  @Get()
  findAll() {
    return this.layananService.findAll(true);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.layananService.findBySlug(slug);
  }
}

// ── Admin endpoints (JWT protected) ───────────────────────────────────
@Controller('admin/layanan')
@UseGuards(JwtAuthGuard)
export class LayananAdminController {
  constructor(private readonly layananService: LayananService) {}

  @Get()
  findAll() {
    return this.layananService.findAll(false);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.layananService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLayananDto) {
    return this.layananService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateLayananDto>) {
    return this.layananService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.layananService.remove(id);
  }
}

// ── Admin category endpoints ───────────────────────────────────────────
@Controller('admin/layanan-categories')
@UseGuards(JwtAuthGuard)
export class LayananCategoryController {
  constructor(private readonly layananService: LayananService) {}

  @Get()
  findAll() {
    return this.layananService.findAllCategories();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.layananService.findOneCategory(id);
  }

  @Post()
  create(@Body() dto: CreateLayananCategoryDto) {
    return this.layananService.createCategory(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateLayananCategoryDto>) {
    return this.layananService.updateCategory(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.layananService.removeCategory(id);
  }
}
