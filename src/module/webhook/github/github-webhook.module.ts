import { Module } from '@nestjs/common';
import { GithubWebhookController } from './github-webhook.controller';
import { GithubWebhookService } from './github-webhook.service';
import { WebhookService } from '../webhook.service';

@Module({
  controllers: [GithubWebhookController],
  providers: [GithubWebhookService, WebhookService],
  exports: [GithubWebhookService],
})
export class GithubWebhookModule {}
