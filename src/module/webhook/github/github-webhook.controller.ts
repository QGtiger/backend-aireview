import {
  Controller,
  Post,
  Headers,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { GithubWebhookService } from './github-webhook.service';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from '../webhook.service';

@Controller('webhook/github')
export class GithubWebhookController {
  constructor(
    private readonly githubWebhookService: GithubWebhookService,
    private readonly configService: ConfigService,
    private readonly webhookService: WebhookService,
  ) {}

  @Post()
  async handleWebhook(@Body() body: any, @Headers() headers: any) {
    console.log(body, headers);

    const webhookSecret = this.configService.get('GITHUB_WEBHOOK_SECRET');
    const signature = headers['x-hub-signature-256'];

    if (webhookSecret) {
      const isValid = this.githubWebhookService.verifySignature(
        JSON.stringify(body),
        signature,
        webhookSecret,
      );
      if (!isValid) {
        throw new BadRequestException('Invalid signature');
      }
    }

    const event = headers['x-github-event'];
    console.log(event);

    if (event === 'push') {
      await this.webhookService.handlePushEvent(body, 'github');
    }
  }
}
