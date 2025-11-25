import { Module } from '@nestjs/common';
import { GitlabWebhookController } from './gitlab-webhook.controller';
import { GitlabWebhookService } from './gitlab-webhook.service';
import { AnalysisModule } from '../../analysis/analysis.module';

@Module({
  imports: [AnalysisModule],
  controllers: [GitlabWebhookController],
  providers: [GitlabWebhookService],
  exports: [GitlabWebhookService],
})
export class GitlabWebhookModule {}
