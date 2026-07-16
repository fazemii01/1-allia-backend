import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnershipWhyUs } from './entities/partnership-why-us.entity';
import { PartnershipWhyUsService } from './partnership-why-us.service';
import { PartnershipWhyUsController } from './partnership-why-us.controller';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PartnershipWhyUs]),
    ActivityLogsModule,
  ],
  controllers: [PartnershipWhyUsController],
  providers: [PartnershipWhyUsService],
  exports: [PartnershipWhyUsService],
})
export class PartnershipWhyUsModule {}
