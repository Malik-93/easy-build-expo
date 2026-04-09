import { Controller, Post, Headers, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('github')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive GitHub App webhook events' })
  github(@Headers('x-github-event') event: string, @Body() payload: any) {
    return this.webhooksService.handleGithub(event, payload);
  }

  @Post('slack/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test Slack webhook notification' })
  slackTest(@Body() dto: { message: string }) {
    return this.webhooksService.sendSlack(dto.message);
  }
}
