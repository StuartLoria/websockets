import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluationGateway } from './evaluation.gateway';
import { EvaluationController } from './evaluation.controller';

@Module({
  providers: [EvaluationService, EvaluationGateway],
  controllers: [EvaluationController],
})
export class EvaluationModule {}
