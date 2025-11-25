import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { GitlabWebhookService } from './gitlab-webhook.service';
import { ConfigService } from '@nestjs/config';
import { AnalysisService } from '@/module/analysis/analysis.service';

@Controller('webhook/gitlab')
export class GitlabWebhookController {
  constructor(
    private readonly gitlabWebhookService: GitlabWebhookService,
    private readonly configService: ConfigService,
    private readonly analysisService: AnalysisService,
  ) {}

  @Post()
  async handleWebhook(@Body() body: any, @Headers() headers: any) {
    const event = headers['x-gitlab-event'];

    console.log(event);

    if (event.toLowerCase().includes('push')) {
      const parsed = await this.gitlabWebhookService.parsePushEvent(body);
      for (const commit of parsed.commits) {
        const analysicResult = await this.gitlabWebhookService.analyzeCommit(
          commit,
        );
      }
    } else {
      throw new BadRequestException('Invalid event');
    }
    return 'ok';
  }
}
