import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitService } from './submit.service';

@ApiTags('Submit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('submit')
export class SubmitController {
  constructor(private readonly submitService: SubmitService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a build to Google Play Store' })
  submit(@CurrentUser() user: any, @Body() dto: any) {
    return this.submitService.submit(user.id, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List submission history for a project' })
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.submitService.findAll(projectId, user.id);
  }
}
