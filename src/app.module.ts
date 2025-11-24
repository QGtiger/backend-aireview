import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CommonInterceptor } from './common/common.interceptor';
import { WebhookModule } from './module/webhook/webhook.module';
import { ConfigModule } from '@nestjs/config';
import { existsSync } from 'fs';
import { validate } from './config/config.validation';

const getEnvFiles = () => {
  const env = process.env.NODE_ENV || 'development';
  const baseFiles = [`.env.${env}.local`, `.env.local`, `.env.${env}`, '.env'];
  return baseFiles.filter((path: string) => existsSync(path)); // 过滤不存在的文件
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFiles(),
      validate,
    }),
    WebhookModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CommonInterceptor,
    },
  ],
})
export class AppModule {}
