import { Controller, Post, Headers, Body } from '@nestjs/common';
import { GithubWebhookService } from './github-webhook.service';

@Controller('webhook/github')
export class GithubWebhookController {
  constructor(private readonly githubWebhookService: GithubWebhookService) {}

  @Post()
  async handleWebhook(@Body() body: any, @Headers() headers: any) {
    console.log(body, headers);
  }
}
