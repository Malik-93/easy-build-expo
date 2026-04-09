import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OtaService {
  constructor(private prisma: PrismaService) {}

  async publish(userId: string, dto: { projectId: string; branch: string; channel?: string; message?: string; runtimeVersion?: string }) {
    const project = await this.prisma.project.findFirst({ where: { id: dto.projectId, ownerId: userId } });
    if (!project) throw new Error('Project not found');

    return this.prisma.otaUpdate.create({
      data: {
        projectId: dto.projectId,
        branch: dto.branch,
        channel: dto.channel,
        message: dto.message,
        runtimeVersion: dto.runtimeVersion,
        bundleUrl: `${process.env.CDN_BASE_URL || 'https://cdn.example.com'}/bundles/${dto.projectId}/${Date.now()}.bundle`,
        rolloutPercent: 100,
      },
    });
  }

  async findAll(projectId: string, userId: string, branch?: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) throw new Error('Access denied');
    return this.prisma.otaUpdate.findMany({
      where: { projectId, ...(branch ? { branch } : {}) },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async rollback(id: string, userId: string) {
    const update = await this.prisma.otaUpdate.findUnique({ where: { id } });
    if (!update) throw new Error('OTA update not found');
    await this.prisma.project.findFirstOrThrow({ where: { id: update.projectId, ownerId: userId } });
    return this.prisma.otaUpdate.update({ where: { id }, data: { isRolledBack: true } });
  }

  async setRollout(id: string, userId: string, percent: number) {
    const update = await this.prisma.otaUpdate.findUnique({ where: { id } });
    if (!update) throw new Error('OTA update not found');
    await this.prisma.project.findFirstOrThrow({ where: { id: update.projectId, ownerId: userId } });
    return this.prisma.otaUpdate.update({ where: { id }, data: { rolloutPercent: percent } });
  }
}
