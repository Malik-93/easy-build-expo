import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OtaService } from './ota.service';

@ApiTags('OTA Updates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ota')
export class OtaController {
  constructor(private readonly otaService: OtaService) {}

  @Post()
  @ApiOperation({ summary: 'Publish a new OTA JS bundle update' })
  publish(@CurrentUser() user: any, @Body() dto: any) {
    return this.otaService.publish(user.id, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List OTA updates for a project' })
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any, @Query('branch') branch?: string) {
    return this.otaService.findAll(projectId, user.id, branch);
  }

  @Patch(':id/rollback')
  @ApiOperation({ summary: 'Rollback an OTA update' })
  rollback(@Param('id') id: string, @CurrentUser() user: any) {
    return this.otaService.rollback(id, user.id);
  }

  @Patch(':id/rollout')
  @ApiOperation({ summary: 'Set rollout percentage for an OTA update' })
  setRollout(@Param('id') id: string, @CurrentUser() user: any, @Body('percent') percent: number) {
    return this.otaService.setRollout(id, user.id, percent);
  }
}
