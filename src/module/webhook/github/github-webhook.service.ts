import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class GithubWebhookService {
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
}
