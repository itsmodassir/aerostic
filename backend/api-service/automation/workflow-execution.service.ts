import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkflowExecution } from "./entities/workflow-execution.entity";
import { WorkflowExecutionLog } from "./entities/workflow-execution-log.entity";

@Injectable()
export class WorkflowExecutionService {
  private readonly logger = new Logger(WorkflowExecutionService.name);

  constructor(
    @InjectRepository(WorkflowExecution)
    private executionRepo: Repository<WorkflowExecution>,
    @InjectRepository(WorkflowExecutionLog)
    private logRepo: Repository<WorkflowExecutionLog>,
  ) {}

  async findExecutionsByWorkflow(workflowId: string, tenantId: string) {
    return this.executionRepo.find({
      where: { workflowId, tenantId },
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  async findOne(executionId: string, tenantId: string) {
    return this.executionRepo.findOne({
      where: { id: executionId, tenantId },
      relations: ["logs"],
    });
  }

  async getLatestExecution(workflowId: string, tenantId: string) {
    return this.executionRepo.findOne({
      where: { workflowId, tenantId },
      order: { createdAt: "DESC" },
    });
  }

  async deleteExecution(executionId: string, tenantId: string) {
    return this.executionRepo.delete({ id: executionId, tenantId });
  }
}
