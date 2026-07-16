import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnershipCollaboration } from './entities/partnership-collaboration.entity';
import { PartnershipCollaborationsService } from './partnership-collaborations.service';
import { PartnershipCollaborationsController } from './partnership-collaborations.controller';
import { SharedModule } from '../shared/shared.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PartnershipCollaboration]),
    SharedModule,
    ActivityLogsModule,
  ],
  controllers: [PartnershipCollaborationsController],
  providers: [PartnershipCollaborationsService],
  exports: [PartnershipCollaborationsService],
})
export class PartnershipCollaborationsModule {}
