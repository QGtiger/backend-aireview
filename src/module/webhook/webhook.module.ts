import { Module } from '@nestjs/common';
import { GithubWebhookModule } from './github/github-webhook.module';
import { WebhookService } from './webhook.service';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [GithubWebhookModule, AnalysisModule],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
