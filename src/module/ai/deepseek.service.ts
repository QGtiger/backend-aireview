import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class DeepSeekService {
  private readonly logger = new Logger(DeepSeekService.name);
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
    this.baseURL =
      this.configService.get<string>('DEEPSEEK_BASE_URL') ||
      'https://api.deepseek.com';

    if (!this.apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY is not set');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 60000, // 60秒超时
    });
  }

  async chat(messages: DeepSeekMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    try {
      const response = await this.axiosInstance.post<DeepSeekResponse>(
        '/v1/chat/completions',
        {
          model:
            this.configService.get<string>('DEEPSEEK_MODEL') || 'deepseek-chat',
          messages,
          // 温度
          temperature: 0.7,
          // 最大 token 数
          max_tokens: 2000,
        },
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from DeepSeek API');
      }

      this.logger.log(
        `DeepSeek API call completed. Tokens used: ${response.data.usage.total_tokens}`,
      );

      return content;
    } catch (error: any) {
      this.logger.error(
        'DeepSeek API error:',
        error.response?.data || error.message,
      );
      throw new Error(`DeepSeek API call failed: ${error.message}`);
    }
  }
}
