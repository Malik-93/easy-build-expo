import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { DriveService } from '../../drive/drive.service';
import { BuildStatus } from '@prisma/client';
import { BUILD_QUEUE } from '../builds.service';

interface BuildJobData {
  buildId: string;
  projectId: string;
  profile: string;
}

@Processor(BUILD_QUEUE)
export class BuildProcessor extends WorkerHost {
  private readonly logger = new Logger(BuildProcessor.name);

  constructor(
    private prisma: PrismaService,
    private drive: DriveService,
  ) {
    super();
  }

  async process(job: Job<BuildJobData>) {
    const { buildId, projectId, profile } = job.data;
    const startedAt = new Date();

    this.logger.log(`▶ Starting build ${buildId} [${profile}]`);

    // Mark build as RUNNING
    await this.prisma.build.update({
      where: { id: buildId },
      data: { status: BuildStatus.RUNNING, startedAt },
    });

    try {
      // Update progress: 10%
      await job.updateProgress(10);
      this.logger.log(`[${buildId}] Preparing Docker container...`);

      // TODO: In production, spawn Docker build container here
      // For now we simulate a build pipeline
      const logs = await this.simulateBuild(job, buildId, profile);

      // Upload a placeholder artifact to Google Drive
      // In production, this would be the actual APK/AAB from the Docker container
      const driveFolderId = await this.drive.createFolder(
        `build-${buildId}`,
        undefined,
      );

      const placeholderContent = Buffer.from(
        `Build ${buildId} | Profile: ${profile} | Completed: ${new Date().toISOString()}`,
      );

      const artifact = await this.drive.uploadFile(
        `app-${profile}.apk`,
        placeholderContent,
        'application/vnd.android.package-archive',
        driveFolderId,
      );

      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await this.prisma.build.update({
        where: { id: buildId },
        data: {
          status: BuildStatus.PASSED,
          logOutput: logs,
          artifactUrl: this.drive.getDownloadLink(artifact.id),
          driveFileId: artifact.id,
          completedAt,
          durationMs,
        },
      });

      await job.updateProgress(100);
      this.logger.log(`✅ Build ${buildId} completed in ${durationMs}ms`);
      return { buildId, status: 'PASSED', artifactUrl: artifact.id };
    } catch (error: any) {
      this.logger.error(`❌ Build ${buildId} failed: ${error.message}`);

      await this.prisma.build.update({
        where: { id: buildId },
        data: {
          status: BuildStatus.FAILED,
          logOutput: error.message,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  private async simulateBuild(
    job: Job,
    buildId: string,
    profile: string,
  ): Promise<string> {
    const steps = [
      { pct: 20, msg: 'Cloning repository...' },
      { pct: 35, msg: 'Installing npm dependencies...' },
      { pct: 50, msg: 'Running Metro bundler...' },
      { pct: 65, msg: 'Running Gradle build...' },
      { pct: 80, msg: 'Signing APK...' },
      { pct: 95, msg: 'Uploading artifact...' },
    ];

    const logs: string[] = [`[${buildId}] Build started — profile: ${profile}`];

    for (const step of steps) {
      await job.updateProgress(step.pct);
      logs.push(`[${new Date().toISOString()}] ${step.msg}`);
      // Simulate work time
      await new Promise((r) => setTimeout(r, 300));
    }

    logs.push(`[${new Date().toISOString()}] Build complete ✅`);
    return logs.join('\n');
  }
}
