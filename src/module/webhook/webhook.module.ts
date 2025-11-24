import { Module } from '@nestjs/common';
import { GithubWebhookModule } from './github/github-webhook.module';
import { WebhookService } from './webhook.service';

@Module({
  imports: [GithubWebhookModule],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
