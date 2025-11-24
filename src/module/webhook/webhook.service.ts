import { Injectable, Logger } from '@nestjs/common';
import { GithubWebhookService } from './github/github-webhook.service';
import { sendMdMessage } from 'src/utils/message';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  constructor(
    private readonly githubWebhookService: GithubWebhookService,
    private readonly analysisService: AnalysisService,
  ) {}

  async handlePushEvent(payload: any, platform: 'github' | 'gitlab') {
    this.logger.log(`Received ${platform} push event`, payload);

    // 解析事件
    const parsed =
      platform === 'github'
        ? await this.githubWebhookService.parsePushEvent(payload)
        : null;

    if (!parsed) {
      this.logger.warn(`Unsupported platform: ${platform}`);
      return;
    }

    for (const commit of parsed.commits) {
      const analysicResult = await this.analysisService.analyzeCommit(commit);
      sendMdMessage('AI 分析', analysicResult.analysisReport);

      await this.githubWebhookService.postComment({
        repository: parsed.repository,
        commit,
        analysisResult: analysicResult,
      });
    }
  }
}
