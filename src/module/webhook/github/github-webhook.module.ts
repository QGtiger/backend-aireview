import { Module } from '@nestjs/common';
import { GithubWebhookController } from './github-webhook.controller';
import { GithubWebhookService } from './github-webhook.service';
import { AnalysisModule } from '../../analysis/analysis.module';

@Module({
  imports: [AnalysisModule],
  controllers: [GithubWebhookController],
  providers: [GithubWebhookService],
  exports: [GithubWebhookService],
})
export class GithubWebhookModule {}
