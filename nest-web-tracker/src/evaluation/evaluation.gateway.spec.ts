import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationGateway } from './evaluation.gateway';

describe('EvaluationGateway', () => {
  let gateway: EvaluationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluationGateway],
    }).compile();

    gateway = module.get<EvaluationGateway>(EvaluationGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
