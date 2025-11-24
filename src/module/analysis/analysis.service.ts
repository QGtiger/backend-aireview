import { Injectable, Logger } from '@nestjs/common';
import { DeepSeekService } from '../ai/deepseek.service';
import { PromptTemplate } from './prompt.template';

export interface AnalysisResult {
  // 代码复杂度分析
  complexity: string;
  // 可行性评估
  feasibility: string;
  // 安全性检查
  security: string;
  overall: string;
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

    // 调用 DeepSeek API
    const response = await this.deepSeekService.chat([
      {
        role: 'system',
        content:
          '你是一位专业的代码审查专家，擅长分析代码的复杂度、可行性和安全性。请用中文回答。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // 解析响应（简单解析，实际可以更复杂）
    const analysis = this.parseAnalysisResponse(response);

    this.logger.log(`Analysis completed for commit ${commit.sha}`);

    return analysis;
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

  private parseAnalysisResponse(response: string): AnalysisResult {
    // 简单的解析逻辑，可以根据实际响应格式优化
    const complexityMatch = response.match(
      /复杂度分析[：:]\s*([^\n]+(?:\n(?!可行性评估)[^\n]+)*)/i,
    );
    const feasibilityMatch = response.match(
      /可行性评估[：:]\s*([^\n]+(?:\n(?!安全性检查)[^\n]+)*)/i,
    );
    const securityMatch = response.match(
      /安全性检查[：:]\s*([^\n]+(?:\n(?!总体评价)[^\n]+)*)/i,
    );
    const overallMatch = response.match(
      /总体评价[：:]\s*([^\n]+(?:\n[^\n]+)*)/i,
    );

    return {
      complexity: complexityMatch
        ? complexityMatch[1].trim()
        : '未提供复杂度分析',
      feasibility: feasibilityMatch
        ? feasibilityMatch[1].trim()
        : '未提供可行性评估',
      security: securityMatch ? securityMatch[1].trim() : '未提供安全性检查',
      overall: overallMatch ? overallMatch[1].trim() : '未提供总体评价',
      rawResponse: response,
    };
  }
}
