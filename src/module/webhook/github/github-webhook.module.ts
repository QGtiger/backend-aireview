import { forwardRef, Module } from '@nestjs/common';
import { GithubWebhookController } from './github-webhook.controller';
import { GithubWebhookService } from './github-webhook.service';
import { WebhookModule } from '../webhook.module';

@Module({
  imports: [forwardRef(() => WebhookModule)],
  controllers: [GithubWebhookController],
  providers: [GithubWebhookService],
  exports: [GithubWebhookService],
})
export class GithubWebhookModule {}
