import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GitlabWebhookService {
  constructor(private readonly configService: ConfigService) {}

  async parsePushEvent(payload: any) {
    const repository: RepositoryInfo = {
      name: payload.repository.name,
      fullName: payload.repository.full_name,
      owner: payload.repository.owner.name,
      url: payload.repository.html_url,
      platform: 'gitlab',
    };

    return { repository, commits: payload.commits };
  }
}
