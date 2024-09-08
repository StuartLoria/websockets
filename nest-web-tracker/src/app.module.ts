import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EvaluationModule } from './evaluation/evaluation.module';
import { RuleEngineService } from './rule-engine/rule-engine.service';
import { RuleEngineGateway } from './rule-engine/rule-engine.gateway';

@Module({
  imports: [EvaluationModule],
  controllers: [AppController],
  providers: [AppService, RuleEngineService, RuleEngineGateway],
})
export class AppModule {}
