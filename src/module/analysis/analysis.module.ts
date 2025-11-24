import { Global, Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AiModule } from '../ai/ai.module';

@Global()
@Module({
  imports: [AiModule],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
