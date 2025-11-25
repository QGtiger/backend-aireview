import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { isCodeFile } from '../../../utils';
import { PromptTemplate } from './prompt.template';
import { AnalysisService } from '@/module/analysis/analysis.service';

interface GitlabCommitPayload {
  id: string;
  message: string;
  timestamp: string;
  url: string;
  author: {
    name: string;
    email: string;
  };
  added: string[];
  removed: string[];
  modified: string[];
}

interface GitlabPayload {
  after: string;
  before: string;
  checkout_sha: string;
  commits: GitlabCommitPayload[];
  project: {
    id: number;
    name: string;
    namespace: string;
    web_url: string;
  };
  project_id: number;
  repository: {
    name: string;
    homepage: string;
  };
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar: string;
  user_email: string;
}

interface GitlabDiff {
  diff: string;
  new_path: string;
  old_path: string;
  a_mode: string;
  b_mode: string;
  new_file: boolean;
  renamed_file: boolean;
  deleted_file: boolean;
}

@Injectable()
export class GitlabWebhookService {
  private readonly logger = new Logger(GitlabWebhookService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly analysisService: AnalysisService,
  ) {
    this.axiosInstance = axios.create({
      baseURL: 'https://gitlab.shadow-rpa.net/api/v4',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async parsePushEvent(payload: GitlabPayload) {
    const repository: RepositoryInfo = {
      name: payload.repository.name,
      fullName: payload.repository.name,
      owner: payload.project.namespace,
      url: payload.project.web_url,
      platform: 'gitlab',
    };

    const projectId = payload.project.id;

    const encodedProjectId = encodeURIComponent(projectId);
    const commits: CommitInfo[] = await Promise.all(
      payload.commits.map(async (commit) => {
        const response = await this.axiosInstance.get(
          `/projects/${encodedProjectId}/repository/commits/${commit.id}/diff`,
        );
        const data = response.data as GitlabDiff[];
        const diffParts: string[] = [];
        data
          .filter((file) => isCodeFile(file.new_path))
          .forEach((file) => {
            if (file.diff) {
              diffParts.push(
                [
                  `文件：${file.new_path} (${
                    file.new_file
                      ? 'added'
                      : file.renamed_file
                      ? 'renamed'
                      : file.deleted_file
                      ? 'deleted'
                      : 'modified'
                  })`,
                  file.diff,
                  '',
                ].join('\n'),
              );
            } else {
              diffParts.push(
                `文件：${file.new_path} (${
                  file.new_file
                    ? 'added'
                    : file.renamed_file
                    ? 'renamed'
                    : file.deleted_file
                    ? 'deleted'
                    : 'modified'
                })`,
              );
              if (file.renamed_file) {
                diffParts.push(
                  `重命名：旧文件：${file.old_path} -> 新文件：${file.new_path}`,
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
          files: data.map((diff) => ({
            filename: diff.new_path,
            status: diff.new_file ? 'added' : 'modified',
            additions: diff.new_file ? 1 : 0,
            deletions: diff.deleted_file ? 1 : 0,
            patch: `文件: ${diff.new_path}\n${diff.diff}`,
          })),
        };
      }),
    );

    return { repository, commits };
  }

  async analyzeCommit(commit: CommitInfo) {
    // 生成 prompt
    const prompt = PromptTemplate.generateAnalysisPrompt(
      commit.message,
      commit.diff,
      commit.files,
    );

    return this.analysisService.analyzeCommit(commit, prompt);
  }
}
