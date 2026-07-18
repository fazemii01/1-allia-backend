import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesClientController, InvoicesPublicController } from './invoices-client.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  controllers: [InvoicesController, InvoicesClientController, InvoicesPublicController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
