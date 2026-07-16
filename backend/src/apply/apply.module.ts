import { Module } from '@nestjs/common';
import { ApplyController } from './apply.controller';
import { PatientsModule } from '../patients/patients.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [PatientsModule, InvoicesModule],
  controllers: [ApplyController],
})
export class ApplyModule {}
