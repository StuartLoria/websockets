import { Controller, Get } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluationGateway } from './evaluation.gateway';

@Controller('evaluation')
export class EvaluationController {
  constructor(
    private readonly evaluationService: EvaluationService,
    private readonly evaluationGateway: EvaluationGateway,
  ) {}

  @Get()
  getEvaluation(): string {
    return this.evaluationService.echoElement({ message: 'Hello' });
  }

  @Get('start')
  async startEvaluation() {
    const collection = [{ id: 1 }, { id: 2 }, { id: 3 }]; // Replace with actual collection
    await this.evaluationGateway.startEvaluation(collection);
    return 'Evaluation started';
  }
}
