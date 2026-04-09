import {
  Controller, Get, Post, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BuildsService } from './builds.service';
import { TriggerBuildDto } from './dto/trigger-build.dto';

@ApiTags('Builds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('builds')
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}

  @Post()
  @ApiOperation({ summary: 'Trigger a new Android build' })
  trigger(@CurrentUser() user: any, @Body() dto: TriggerBuildDto) {
    return this.buildsService.triggerBuild(user.id, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List builds for a project' })
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.buildsService.findAll(projectId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get build details' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.buildsService.findOne(id, user.id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get build log output' })
  getLogs(@Param('id') id: string, @CurrentUser() user: any) {
    return this.buildsService.getBuildLogs(id, user.id);
  }

  @Delete(':id/cancel')
  @ApiOperation({ summary: 'Cancel a queued or running build' })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.buildsService.cancel(id, user.id);
  }
}
