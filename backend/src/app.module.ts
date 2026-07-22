import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { TherapistsModule } from './therapists/therapists.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { LayananModule } from './layanan/layanan.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { EdukasiModule } from './edukasi/edukasi.module';
import { ApplyModule } from './apply/apply.module';
import { PermissionsModule } from './permissions/permissions.module';
import { SharedModule } from './shared/shared.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BannersModule } from './banners/banners.module';
import { PartnershipsModule } from './partnerships/partnerships.module';
import { PartnershipWhyUsModule } from './partnership-why-us/partnership-why-us.module';
import { PartnershipCollaborationsModule } from './partnership-collaborations/partnership-collaborations.module';
import { PartnershipMomentsModule } from './partnership-moments/partnership-moments.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { TherapyProgressModule } from './therapy-progress/therapy-progress.module';

@Module({
  imports: [
    // ── Global Config (.env) ─────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── TypeORM + PostgreSQL ─────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASS', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'alliakids_db'),
        autoLoadEntities: true,
        synchronize: true,
        logging: ['error', 'schema', 'warn'],
      }),
      inject: [ConfigService],
    }),

    // ── Feature Modules ───────────────────────────────────────────────
    AuthModule,
    TherapistsModule,
    PatientsModule,
    AppointmentsModule,
    InvoicesModule,
    LayananModule,
    WhatsAppModule,
    EdukasiModule,
    ApplyModule,
    PermissionsModule,
    SharedModule,
    ActivityLogsModule,
    DashboardModule,
    BannersModule,
    PartnershipsModule,
    PartnershipWhyUsModule,
    PartnershipCollaborationsModule,
    PartnershipMomentsModule,
    TestimonialsModule,
    PaymentMethodsModule,
    TherapyProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
