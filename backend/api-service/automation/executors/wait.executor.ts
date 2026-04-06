import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class WaitExecutor {
  private readonly logger = new Logger(WaitExecutor.name);

  async execute(node: any): Promise<any> {
    const duration = parseFloat(node.data?.duration || "1");
    const unit = node.data?.unit || "minutes";

    let delayMs = 0;

    switch (unit) {
      case "seconds":
        delayMs = duration * 1000;
        break;
      case "minutes":
        delayMs = duration * 60 * 1000;
        break;
      case "hours":
        delayMs = duration * 60 * 60 * 1000;
        break;
      case "days":
        delayMs = duration * 24 * 60 * 60 * 1000;
        break;
      default:
        delayMs = duration * 60 * 1000; // Default to minutes
    }

    this.logger.log(`Node ${node.id} requested a wait of ${duration} ${unit} (${delayMs}ms)`);

    return {
      status: "paused",
      delay: delayMs,
      resumable: true,
    };
  }
}
