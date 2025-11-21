import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { sendMessage } from './utils/message';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('message')
  async sendMessage(@Body() body: any) {
    await sendMessage(JSON.stringify(body, null, 2));
  }
}
