import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CredentialsService } from './credentials.service';

@ApiTags('Credentials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post('project/:projectId')
  @ApiOperation({ summary: 'Upload a keystore for a project' })
  upload(@Param('projectId') projectId: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.credentialsService.uploadKeystore(projectId, user.id, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List keystores for a project' })
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.credentialsService.findAll(projectId, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a keystore' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.credentialsService.remove(id, user.id);
  }
}
