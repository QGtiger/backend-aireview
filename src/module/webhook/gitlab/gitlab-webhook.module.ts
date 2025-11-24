import { forwardRef, Module } from '@nestjs/common';
import { GitlabWebhookController } from './gitlab-webhook.controller';
import { GitlabWebhookService } from './gitlab-webhook.service';
import { WebhookModule } from '../webhook.module';

@Module({
  imports: [forwardRef(() => WebhookModule)],
  controllers: [GitlabWebhookController],
  providers: [GitlabWebhookService],
  exports: [GitlabWebhookService],
})
export class GitlabWebhookModule {}
