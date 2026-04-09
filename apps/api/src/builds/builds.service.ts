import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerBuildDto } from './dto/trigger-build.dto';
import { BuildStatus } from '@prisma/client';

export const BUILD_QUEUE = 'builds';

@Injectable()
export class BuildsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(BUILD_QUEUE) private buildQueue: Queue,
  ) {}

  async triggerBuild(userId: string, dto: TriggerBuildDto) {
    // Verify project ownership
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, ownerId: userId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Create build record
    const build = await this.prisma.build.create({
      data: {
        projectId: dto.projectId,
        profile: dto.profile as any,
        platform: 'android',
        status: 'QUEUED',
        triggeredBy: userId,
        gitRef: dto.gitRef,
        gitCommit: dto.gitCommit,
      },
    });

    // Enqueue build job (priority: production > preview > development)
    const priority = dto.profile === 'production' ? 1 : dto.profile === 'preview' ? 2 : 3;
    await this.buildQueue.add(
      'run-build',
      { buildId: build.id, projectId: dto.projectId, profile: dto.profile },
      { priority, attempts: 1, removeOnComplete: 50, removeOnFail: 100 },
    );

    return build;
  }

  async findAll(projectId: string, userId: string) {
    await this.verifyProjectOwner(projectId, userId);
    return this.prisma.build.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findOne(id: string, userId: string) {
    const build = await this.prisma.build.findUnique({ where: { id } });
    if (!build) throw new NotFoundException('Build not found');
    await this.verifyProjectOwner(build.projectId, userId);
    return build;
  }

  async cancel(id: string, userId: string) {
    const build = await this.findOne(id, userId);
    if (!['QUEUED', 'RUNNING'].includes(build.status)) {
      throw new Error('Build cannot be cancelled in its current state');
    }

    // Remove from queue if still queued
    const jobs = await this.buildQueue.getJobs(['waiting', 'active']);
    const job = jobs.find((j) => j.data.buildId === id);
    if (job) await job.remove();

    return this.prisma.build.update({
      where: { id },
      data: { status: BuildStatus.CANCELLED, completedAt: new Date() },
    });
  }

  async getBuildLogs(id: string, userId: string) {
    const build = await this.findOne(id, userId);
    return { logs: build.logOutput || '' };
  }

  private async verifyProjectOwner(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
