import { Injectable, Logger } from "@nestjs/common";
import { NodeExecutor } from "./executor.interface";
import { VariableResolverService } from "../variable-resolver.service";

@Injectable()
export class ConditionExecutor implements NodeExecutor {
  private readonly logger = new Logger(ConditionExecutor.name);

  constructor(private variableResolver: VariableResolverService) {}

  async execute(node: any, context: any): Promise<any> {
    const data = node.data;
    const operator = data.operator || "contains";
    const variable = data.variable || data.input || "{{trigger.body}}";
    const value = this.variableResolver
      .resolve(data.value || data.keyword || "", context)
      .toLowerCase();

    const inputRaw = this.variableResolver.resolve(variable, context);
    const input = String(inputRaw || "").toLowerCase();

    let match = false;
    switch (operator) {
      case "contains":
        match = input.includes(value);
        break;
      case "equals":
        match = input === value;
        break;
      case "exists":
        match = !!inputRaw;
        break;
      case "isEmpty":
        match = !inputRaw || input === "";
        break;
      case "startsWith":
        match = input.startsWith(value);
        break;
      case "endsWith":
        match = input.endsWith(value);
        break;
      default:
        this.logger.warn(`Unsupported operator: ${operator}`);
        match = false;
    }

    this.logger.log(
      `Condition evaluated: "${input}" ${operator} "${value}" -> ${match}`,
    );

    return {
      match,
      branch: match ? "true" : "false",
    };
  }
}
