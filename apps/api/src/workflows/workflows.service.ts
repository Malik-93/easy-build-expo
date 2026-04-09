import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as YAML from 'yaml';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(private prisma: PrismaService) {}

  async triggerWorkflow(userId: string, dto: { projectId: string; workflowFile: string; trigger: string }) {
    const project = await this.prisma.project.findFirst({ where: { id: dto.projectId, ownerId: userId } });
    if (!project) throw new Error('Project not found');

    const run = await this.prisma.workflowRun.create({
      data: {
        projectId: dto.projectId,
        workflowFile: dto.workflowFile,
        trigger: dto.trigger,
        status: 'QUEUED',
      },
    });

    // Parse YAML workflow and create jobs
    this.executeWorkflow(run.id, dto.workflowFile).catch((e) =>
      this.logger.error(`Workflow ${run.id} failed: ${e.message}`),
    );

    return run;
  }

  async findAll(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) throw new Error('Access denied');
    return this.prisma.workflowRun.findMany({
      where: { projectId },
      include: { jobs: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async findOne(id: string, userId: string) {
    const run = await this.prisma.workflowRun.findUnique({ where: { id }, include: { jobs: true } });
    if (!run) throw new Error('Workflow run not found');
    await this.prisma.project.findFirstOrThrow({ where: { id: run.projectId, ownerId: userId } });
    return run;
  }

  private async executeWorkflow(runId: string, workflowFile: string) {
    // Simulate YAML workflow execution
    const sampleWorkflow = {
      jobs: [
        { name: 'build', type: 'eas/build' },
        { name: 'submit', type: 'eas/submit' },
        { name: 'notify', type: 'eas/slack' },
      ],
    };

    await this.prisma.workflowRun.update({ where: { id: runId }, data: { status: 'RUNNING', startedAt: new Date() } });

    for (const jobDef of sampleWorkflow.jobs) {
      const job = await this.prisma.workflowJob.create({
        data: { workflowRunId: runId, name: jobDef.name, type: jobDef.type, status: 'RUNNING', startedAt: new Date() },
      });
      await new Promise((r) => setTimeout(r, 500));
      await this.prisma.workflowJob.update({ where: { id: job.id }, data: { status: 'PASSED', completedAt: new Date() } });
    }

    await this.prisma.workflowRun.update({ where: { id: runId }, data: { status: 'PASSED', completedAt: new Date() } });
    this.logger.log(`✅ Workflow run ${runId} completed`);
  }
}
