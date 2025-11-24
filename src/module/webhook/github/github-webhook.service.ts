import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubWebhookService {
  private readonly logger = new Logger(GithubWebhookService.name);
  private readonly octokit: Octokit;

  constructor(private readonly configService: ConfigService) {
    const githubToken = this.configService.get('GITHUB_TOKEN');
    if (!githubToken) {
      this.logger.error('GITHUB_TOKEN is not set');
      throw new Error('GITHUB_TOKEN is not set');
    }
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  /**
   * 验证 GitHub Webhook 签名
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!signature) {
      return false;
    }

    const hmac = createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return signature === digest;
  }

  async parsePushEvent(payload: PushEventPayload) {
    const repository: RepositoryInfo = {
      name: payload.repository.name,
      fullName: payload.repository.full_name,
      owner: payload.repository.owner.name,
      url: payload.repository.html_url,
      platform: 'github',
    };

    const [owner, repo] = payload.repository.full_name.split('/');

    const commits: CommitInfo[] = await Promise.all(
      (payload.commits || []).map(async (commit) => {
        const response = await this.octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.id,
        });

        this.logger.log(response.data);
        return {
          sha: commit.id,
          message: commit.message,
          author: commit.author,
          url: commit.url,
          diff: commit.added.concat(commit.removed, commit.modified).join('\n'),
          files: [],
        };
      }),
    );

    return {
      repository,
      commits,
      ref: payload.ref,
      before: payload.before,
      after: payload.after,
      pusher: payload.pusher,
    };
  }
}
