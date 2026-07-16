import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Edukasi } from './entities/edukasi.entity';
import { EdukasiService } from './edukasi.service';
import { EdukasiPublicController, EdukasiAdminController } from './edukasi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Edukasi])],
  controllers: [EdukasiPublicController, EdukasiAdminController],
  providers: [EdukasiService],
  exports: [EdukasiService],
})
export class EdukasiModule {}
