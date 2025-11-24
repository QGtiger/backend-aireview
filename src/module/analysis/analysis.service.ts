import { Injectable, Logger } from '@nestjs/common';
import { DeepSeekService } from '../ai/deepseek.service';
import { PromptTemplate } from './prompt.template';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(private readonly deepSeekService: DeepSeekService) {}

  async analyzeCommit(commit: CommitInfo): Promise<AnalysisResult> {
    this.logger.log(`Analyzing commit ${commit.sha}`);

    // 构建 diff 内容
    const diff = this.buildDiff(commit);

    // 生成 prompt
    const prompt = PromptTemplate.generateAnalysisPrompt(
      commit.message,
      diff,
      commit.files,
    );

    // 调用 DeepSeek API（使用 JSON 输出模式）
    const response =
      await this.deepSeekService.chatWithJsonOutput<DeepSeekAnalysisResponse>([
        {
          role: 'system',
          content:
            '你是一位专业的代码审查专家，擅长分析代码的复杂度、可行性和安全性。请用中文回答，并严格按照 JSON 格式输出结果。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

    // 验证响应结构
    if (!response.analysisReport || !Array.isArray(response.lineComments)) {
      this.logger.warn('Invalid response structure from DeepSeek API');
      throw new Error('Invalid response structure from DeepSeek API');
    }

    // 验证 lineComments 格式
    const validatedLineComments = response.lineComments.map((comment) => {
      if (!['error', 'warning', 'info'].includes(comment.severity)) {
        this.logger.warn(
          `Invalid severity: ${comment.severity}, defaulting to 'info'`,
        );
        comment.severity = 'info';
      }
      return comment;
    });

    // 在报告开头添加 commit 信息链接
    const commitLink = `[🔗 查看完整提交](${commit.url})`;
    const commitInfo = `## 📝 提交信息\n\n| 项目 | 内容 |\n|------|------|\n| 提交信息 | ${
      commit.message
    } |\n| 提交 SHA | \`${commit.sha.substring(
      0,
      7,
    )}\` |\n| 链接 | ${commitLink} |\n\n---\n\n`;
    const analysisReportWithLink = commitInfo + response.analysisReport;

    this.logger.log(`Analysis completed for commit ${commit.sha}`);
    this.logger.log(`Found ${validatedLineComments.length} line comments`);

    return {
      analysisReport: analysisReportWithLink,
      lineComments: validatedLineComments,
      rawResponse: JSON.stringify(response, null, 2),
    };
  }

  private buildDiff(commit: CommitInfo): string {
    if (commit.diff) {
      return commit.diff;
    }

    // 如果没有 diff，从文件变更中构建
    return commit.files
      .map((file) => {
        if (file.patch) {
          return `文件: ${file.filename}\n${file.patch}`;
        }
        return `文件: ${file.filename} (${file.status})`;
      })
      .join('\n\n');
  }
}
