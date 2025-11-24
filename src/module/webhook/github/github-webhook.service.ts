import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Octokit } from '@octokit/rest';
import { isCodeFile } from '../../../utils';

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
        // 获取 commit 详情
        const response = await this.octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.id,
        });

        const commitData = response.data;

        const diffParts: string[] = [];
        const files: FileChange[] = [];

        // 处理文件变化
        commitData.files
          .filter((file) => isCodeFile(file.filename))
          .forEach((file) => {
            files.push({
              filename: file.filename,
              status: file.status,
              additions: file.additions,
              deletions: file.deletions,
              patch: file.patch,
            });

            if (file.patch) {
              diffParts.push(
                [
                  `文件：${file.filename} (${file.status})`,
                  file.patch,
                  '',
                ].join('\n'),
              );
            } else {
              diffParts.push(`文件：${file.filename} (${file.status})`);
              if (file.status === 'renamed') {
                diffParts.push(
                  `重命名：旧文件：${file.previous_filename} -> 新文件：${file.filename}`,
                );
              }
              diffParts.push('');
            }
          });

        const diff = diffParts.join('\n');

        return {
          sha: commit.id,
          message: commit.message,
          author: commit.author,
          url: commit.url,
          diff,
          files,
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

  async postComment({
    repository,
    commit,
    analysisResult,
  }: {
    repository: RepositoryInfo;
    commit: CommitInfo;
    analysisResult: AnalysisResult;
  }) {
    const [owner, repo] = repository.fullName.split('/');

    const lineComments = await Promise.all(
      analysisResult.lineComments?.map(async (comment) => {
        const response = await this.octokit.repos.createCommitComment({
          owner,
          repo,
          commit_sha: commit.sha,
          body: `**${comment.severity.toUpperCase()}:** ${comment.comment}`,
          path: comment.path,
          line: comment.line,
          position: comment.position,
        });
        return response.data;
      }),
    );

    const response = await this.octokit.repos.createCommitComment({
      owner,
      repo,
      commit_sha: commit.sha,
      body: analysisResult.analysisReport,
    });
    return {
      commitComment: response.data,
      lineComments,
    };
  }
}
