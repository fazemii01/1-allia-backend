import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaLog } from './entities/wa-log.entity';
import { WaTemplate } from './entities/wa-template.entity';
import { WaAutoReply } from './entities/wa-auto-reply.entity';
import { WhatsAppService } from './whatsapp.service';
import { WaSenderService } from './wasender.service';
import { WhatsAppController, WhatsAppWebhookController } from './whatsapp.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([WaLog, WaTemplate, WaAutoReply])],
  controllers: [WhatsAppController, WhatsAppWebhookController],
  providers: [WhatsAppService, WaSenderService],
  exports: [WhatsAppService, WaSenderService],
})
export class WhatsAppModule {}
