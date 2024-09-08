import { Injectable } from '@nestjs/common';

@Injectable()
export class EvaluationService {
  private evaluationStatus: { [key: string]: string } = {};

  // Test the app in browser
  echoElement(element: any): string {
    return element;
  }

  async evaluateElement(element: any): Promise<string> {
    return new Promise((resolve) => {
      // Simulate long-running process
      setTimeout(() => {
        resolve(`Processed element with id ${element.id}`);
      }, 10_000);
    });
  }

  async evaluateCollection(
    collection: any[],
    notifyUpdate: (id: string, status: string) => void,
  ) {
    for (const element of collection) {
      const elementEvaluationResult = await this.evaluateElement(element);
      this.evaluationStatus[element.id] = elementEvaluationResult;
      notifyUpdate(element.id, elementEvaluationResult);
    }
  }

  getStatus() {
    return this.evaluateCollection;
  }
}
