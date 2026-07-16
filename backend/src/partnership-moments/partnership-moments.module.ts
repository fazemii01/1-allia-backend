import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnershipMoment } from './entities/partnership-moment.entity';
import { PartnershipMomentsService } from './partnership-moments.service';
import { PartnershipMomentsController } from './partnership-moments.controller';
import { SharedModule } from '../shared/shared.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PartnershipMoment]),
    SharedModule,
    ActivityLogsModule,
  ],
  controllers: [PartnershipMomentsController],
  providers: [PartnershipMomentsService],
  exports: [PartnershipMomentsService],
})
export class PartnershipMomentsModule {}
