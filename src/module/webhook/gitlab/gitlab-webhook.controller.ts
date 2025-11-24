import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { GitlabWebhookService } from './gitlab-webhook.service';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from '../webhook.service';

@Controller('webhook/gitlab')
export class GitlabWebhookController {
  constructor(
    private readonly gitlabWebhookService: GitlabWebhookService,
    private readonly configService: ConfigService,
    private readonly webhookService: WebhookService,
  ) {}

  @Post()
  async handleWebhook(@Body() body: any, @Headers() headers: any) {
    const webhookSecret = this.configService.get('GITLAB_WEBHOOK_TOKEN');
    const signature = headers['x-gitlab-token'];

    if (webhookSecret && signature !== webhookSecret) {
      throw new BadRequestException('Invalid signature');
    }

    const event = headers['x-gitlab-event'];

    if (event.includes('push')) {
      await this.webhookService.handlePushEvent(body, 'gitlab');
    } else {
      throw new BadRequestException('Invalid event');
    }
  }
}
