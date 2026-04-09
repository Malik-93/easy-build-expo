import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SecretsService } from './secrets.service';

@ApiTags('Secrets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Post('project/:projectId')
  @ApiOperation({ summary: 'Create or update a secret' })
  create(@Param('projectId') projectId: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.secretsService.create(projectId, user.id, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List secrets for a project (values decrypted)' })
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.secretsService.findAll(projectId, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a secret' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.secretsService.remove(id, user.id);
  }
}
