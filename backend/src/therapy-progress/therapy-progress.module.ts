import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TherapyProgressLog } from './entities/therapy-progress-log.entity';
import { TherapyProgressService } from './therapy-progress.service';
import {
  TherapyProgressAdminController,
  TherapyProgressClientController,
} from './therapy-progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TherapyProgressLog])],
  controllers: [TherapyProgressAdminController, TherapyProgressClientController],
  providers: [TherapyProgressService],
  exports: [TherapyProgressService],
})
export class TherapyProgressModule {}
