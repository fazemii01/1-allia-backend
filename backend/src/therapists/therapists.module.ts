import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TherapistsService } from './therapists.service';
import { TherapistsController } from './therapists.controller';
import { TherapistsPublicController } from './therapists-public.controller';
import { Therapist } from './entities/therapist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Therapist])],
  controllers: [TherapistsController, TherapistsPublicController],
  providers: [TherapistsService],
  exports: [TherapistsService],
})
export class TherapistsModule {}
