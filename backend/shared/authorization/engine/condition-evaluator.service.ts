import { Injectable } from "@nestjs/common";

@Injectable()
export class ConditionEvaluatorService {
  evaluate(conditions: Record<string, any>, context: any): boolean {
    if (!conditions || Object.keys(conditions).length === 0) return true;

    // Basic condition logic: e.g., plan check, risk threshold
    for (const [key, expectedValue] of Object.entries(conditions)) {
      if (context[key] !== expectedValue) return false;
    }

    return true;
  }
}
