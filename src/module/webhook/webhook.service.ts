import { Injectable, Logger } from '@nestjs/common';
import { GithubWebhookService } from './github/github-webhook.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  constructor(private readonly githubWebhookService: GithubWebhookService) {}

  handlePushEvent(payload: any, platform: 'github' | 'gitlab') {
    this.logger.log(`Received ${platform} push event`, payload);

    // 解析事件
    const parsed =
      platform === 'github'
        ? this.githubWebhookService.parsePushEvent(payload)
        : {};
  }
}
