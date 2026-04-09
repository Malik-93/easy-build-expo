import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private config: ConfigService) {}

  async handleGithub(event: string, payload: any) {
    this.logger.log(`GitHub event: ${event} — repo: ${payload?.repository?.full_name}`);

    if (event === 'push' && payload?.ref === 'refs/heads/main') {
      this.logger.log('Push to main detected — triggering CI workflow');
      // TODO: Auto-trigger workflow run for linked project
    }

    if (event === 'pull_request' && payload?.action === 'opened') {
      this.logger.log('PR opened — triggering preview build');
    }

    return { received: true, event };
  }

  async sendSlack(message: string) {
    const webhookUrl = this.config.get<string>('SLACK_WEBHOOK_URL');
    if (!webhookUrl) {
      this.logger.warn('SLACK_WEBHOOK_URL not configured');
      return { sent: false };
    }

    await axios.post(webhookUrl, { text: message });
    this.logger.log(`Slack notification sent: ${message}`);
    return { sent: true };
  }
}
