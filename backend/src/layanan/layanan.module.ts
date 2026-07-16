import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Layanan } from './entities/layanan.entity';
import { LayananCategory } from './entities/layanan-category.entity';
import { LayananService } from './layanan.service';
import {
  LayananPublicController,
  LayananAdminController,
  LayananCategoryController,
} from './layanan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Layanan, LayananCategory])],
  controllers: [LayananPublicController, LayananAdminController, LayananCategoryController],
  providers: [LayananService],
  exports: [LayananService],
})
export class LayananModule {}
