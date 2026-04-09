import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PlayStoreTrack, SubmissionStatus } from '@prisma/client';

@Injectable()
export class SubmitService {
  private readonly logger = new Logger(SubmitService.name);

  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async submit(userId: string, dto: { projectId: string; buildId: string; track: PlayStoreTrack; rolloutPercent?: number }) {
    const project = await this.prisma.project.findFirst({ where: { id: dto.projectId, ownerId: userId } });
    if (!project) throw new Error('Project not found');

    const build = await this.prisma.build.findUnique({ where: { id: dto.buildId } });
    if (!build || build.status !== 'PASSED') throw new Error('Build is not ready for submission');

    const submission = await this.prisma.submission.create({
      data: { projectId: dto.projectId, buildId: dto.buildId, track: dto.track, status: 'PENDING' },
    });

    // Fire-and-forget submission (in production this would be a BullMQ job)
    this.runSubmission(submission.id, build.artifactUrl || '', dto.track, project.packageName || '', dto.rolloutPercent || 100).catch(
      (e) => this.logger.error(`Submission ${submission.id} failed: ${e.message}`),
    );

    return submission;
  }

  async findAll(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) throw new Error('Access denied');
    return this.prisma.submission.findMany({ where: { projectId }, orderBy: { submittedAt: 'desc' } });
  }

  private async runSubmission(submissionId: string, artifactUrl: string, track: PlayStoreTrack, packageName: string, rolloutPercent: number) {
    try {
      this.logger.log(`📦 Submitting to Play Store [${track}] — ${packageName}`);
      // TODO: Integrate actual Google Play Developer API here
      // const androidPublisher = google.androidpublisher({ version: 'v3', auth });
      // ... upload APK/AAB and finalize edit
      await new Promise((r) => setTimeout(r, 1000)); // simulate

      await this.prisma.submission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.SUBMITTED },
      });
      this.logger.log(`✅ Submission ${submissionId} successful`);
    } catch (e: any) {
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.FAILED, errorDetail: e.message },
      });
    }
  }
}
