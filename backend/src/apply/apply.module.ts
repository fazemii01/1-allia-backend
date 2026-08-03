import { Module } from '@nestjs/common';
import { ApplyController } from './apply.controller';
import { PatientsModule } from '../patients/patients.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { AuthModule } from '../auth/auth.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [PatientsModule, InvoicesModule, AuthModule, WhatsAppModule],
  controllers: [ApplyController],
})
export class ApplyModule {}

