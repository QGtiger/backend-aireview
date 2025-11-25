import {
  Controller,
  Post,
  Headers,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { GithubWebhookService } from './github-webhook.service';
import { ConfigService } from '@nestjs/config';
import { sendMdMessage } from '../../../utils/message';

@Controller('webhook/github')
export class GithubWebhookController {
  constructor(
    private readonly githubWebhookService: GithubWebhookService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async handleWebhook(@Body() body: any, @Headers() headers: any) {
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
      const parsed = await this.githubWebhookService.parsePushEvent(body);

      for (const commit of parsed.commits) {
        const analysicResult = await this.githubWebhookService.analyzeCommit(
          commit,
        );

        const { lineComments } = await this.githubWebhookService.postComment({
          repository: parsed.repository,
          commit,
          analysisResult: analysicResult,
        });

        const lineCommentsContent = lineComments.reduce((acc, comment) => {
          return (
            acc +
            `[${comment.path}:${comment.line}](${comment.html_url})` +
            '\n'
          );
        }, '');

        await sendMdMessage(
          'AI 分析',
          lineCommentsContent + analysicResult.analysisReport,
        );
      }
    }
  }
}
