import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepo: Repository<ActivityLog>,
  ) {}

  async log(params: {
    userId: number | null;
    action: string;
    modelType?: string;
    modelId?: string;
    description: string;
    properties?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const logEntry = this.activityLogRepo.create({
      userId: params.userId,
      action: params.action,
      modelType: params.modelType || null,
      modelId: params.modelId || null,
      description: params.description,
      properties: params.properties || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    });
    return this.activityLogRepo.save(logEntry);
  }

  async findAll(filters?: { action?: string; userId?: number; search?: string }) {
    const qb = this.activityLogRepo.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC');

    if (filters?.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters?.userId) {
      qb.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters?.search) {
      qb.andWhere(
        '(log.description ILIKE :search OR log.modelType ILIKE :search OR user.name ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return qb.getMany();
  }
}
