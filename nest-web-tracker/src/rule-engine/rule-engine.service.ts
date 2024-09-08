import { Injectable } from '@nestjs/common';

@Injectable()
export class RuleEngineService {
  private evaluatedInitiatives: number;
  private initiativesToEvaluate: number;

  constructor() {
    this.evaluatedInitiatives = 0;
    this.initiativesToEvaluate = 650;
  }

  /*
   * Trigger the rule engine refresh, communicate the progress on an interval and stop when complete
   */
  triggerRuleEngineRefresh(
    progressCallback: (progress: number) => void,
    completeCallback: () => void,
  ): boolean {
    if (this.evaluatedInitiatives > 0) {
      console.log('Rule Engine Refresh has ALREADY started');

      return false;
    }
    console.log('NEW Rule Engine Refresh started');

    const interval = setInterval(() => {
      const currentProgress = Math.floor(
        (this.evaluatedInitiatives * 100) / this.initiativesToEvaluate,
      );

      if (currentProgress < 100) {
        console.log(
          `Rule Engine Refresh progress UPDATE completed initiatives[${this.evaluatedInitiatives}] of ${this.initiativesToEvaluate}`,
        );
        this.evaluatedInitiatives += 10;
        progressCallback(currentProgress);
      } else {
        console.log('Rule Engine Refresh COMPLETED');
        this.evaluatedInitiatives = 0;
        clearInterval(interval);
        completeCallback();
      }
    }, 1_000);

    return true;
  }
}
