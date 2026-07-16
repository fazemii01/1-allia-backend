import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController, MyPermissionsController } from './permissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RolePermission])],
  controllers: [PermissionsController, MyPermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
