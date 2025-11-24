import { Injectable, Logger } from '@nestjs/common';
import { DeepSeekService } from '../ai/deepseek.service';
import { PromptTemplate } from './prompt.template';

// 行级评论接口
export interface LineComment {
  path: string;
  line: number;
  comment: string;
  severity: 'error' | 'warning' | 'info';
}

// DeepSeek API 返回的 JSON 结构
interface DeepSeekAnalysisResponse {
  analysisReport: string; // 改为字符串，包含完整的代码审查结果
  lineComments: LineComment[];
}

// 最终返回的分析结果
export interface AnalysisResult {
  analysisReport: string; // 改为字符串
  lineComments: LineComment[];
  rawResponse: string;
}

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

    this.logger.log(`Analysis completed for commit ${commit.sha}`);
    this.logger.log(`Found ${validatedLineComments.length} line comments`);

    return {
      analysisReport: response.analysisReport,
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
