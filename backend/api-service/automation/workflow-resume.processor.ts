import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkflowRunnerService } from "./workflow-runner.service";
import { Workflow } from "./entities/workflow.entity";
import { WorkflowExecution, ExecutionStatus } from "./entities/workflow-execution.entity";

@Processor("workflow-resume")
export class WorkflowResumeProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowResumeProcessor.name);

  constructor(
    private readonly workflowRunner: WorkflowRunnerService,
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private readonly executionRepo: Repository<WorkflowExecution>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { executionId, nodeId, tenantId } = job.data;
    
    this.logger.log(`Resuming execution ${executionId} from node ${nodeId}`);

    // 1. Fetch Execution & Workflow
    const execution = await this.executionRepo.findOne({
      where: { id: executionId, tenantId }
    });

    if (!execution) {
      this.logger.error(`Execution ${executionId} not found for resumption`);
      return;
    }

    const workflow = await this.workflowRepo.findOne({
      where: { id: execution.workflowId, tenantId }
    });

    if (!workflow) {
      this.logger.error(`Workflow ${execution.workflowId} not found for resumption`);
      return;
    }

    // 2. Set Status back to RUNNING
    execution.status = ExecutionStatus.RUNNING;
    await this.executionRepo.save(execution);

    // 3. Find Children of the Wait Node
    const edges = workflow.edges.filter(e => e.source === nodeId);
    
    for (const edge of edges) {
      const nextNode = workflow.nodes.find(n => n.id === edge.target);
      if (nextNode) {
        await this.workflowRunner.executeNode(
          workflow,
          nextNode,
          execution,
          execution.context,
          0 // Reset recursion depth for the new branch
        );
      }
    }

    // 4. Check if we need to mark the whole execution as COMPLETED
    // Note: In a production system, you'd check if all branches are done.
    // For now, we rely on the final node in the branch to not fail.
    // Let's check status again after execution
    const updatedExecution = await this.executionRepo.findOneBy({ id: executionId });
    if (updatedExecution && updatedExecution.status === ExecutionStatus.RUNNING) {
        updatedExecution.status = ExecutionStatus.COMPLETED;
        updatedExecution.completedAt = new Date();
        await this.executionRepo.save(updatedExecution);
    }
  }
}
