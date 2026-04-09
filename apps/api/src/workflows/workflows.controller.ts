import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkflowsService } from './workflows.service';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post('run')
  @ApiOperation({ summary: 'Trigger a CI/CD workflow run' })
  run(@CurrentUser() user: any, @Body() dto: any) {
    return this.workflowsService.triggerWorkflow(user.id, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List workflow runs for a project' })
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.workflowsService.findAll(projectId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workflow run with job details' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowsService.findOne(id, user.id);
  }
}
