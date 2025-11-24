import { plainToInstance } from 'class-transformer';
import { IsString, IsOptional, IsNumber, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsString()
  DEEPSEEK_API_KEY: string;

  @IsOptional()
  @IsString()
  DEEPSEEK_BASE_URL?: string;

  @IsOptional()
  @IsString()
  DEEPSEEK_MODEL?: string;

  @IsOptional()
  @IsString()
  GITHUB_TOKEN?: string;

  @IsOptional()
  @IsString()
  GITHUB_WEBHOOK_SECRET?: string;

  @IsOptional()
  @IsString()
  GITLAB_TOKEN?: string;

  @IsOptional()
  @IsString()
  GITLAB_WEBHOOK_TOKEN?: string;

  @IsOptional()
  @IsString()
  GITLAB_BASE_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
