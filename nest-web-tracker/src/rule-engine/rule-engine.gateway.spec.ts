import { Test, TestingModule } from '@nestjs/testing';
import { RuleEngineGateway } from './rule-engine.gateway';

describe('RuleEngineGateway', () => {
  let gateway: RuleEngineGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleEngineGateway],
    }).compile();

    gateway = module.get<RuleEngineGateway>(RuleEngineGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
