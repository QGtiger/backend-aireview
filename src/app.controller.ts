import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
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
  async sendMessage(@Body() body: any, @Headers() headers: any) {
    await sendMessage(
      JSON.stringify(
        {
          body,
          headers,
        },
        null,
        2,
      ),
    );
  }
}
