import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RLPolicy } from "../../shared/database/entities/analytics/rl-policy.entity";
import { RLExperience } from "../../shared/database/entities/analytics/rl-experience.entity";
import { RedisService } from "@shared/redis.service";

@Injectable()
export class AdaptiveThresholdService {
  private readonly logger = new Logger(AdaptiveThresholdService.name);
  private readonly MIN_THRESHOLD = 40;
  private readonly MAX_THRESHOLD = 120;
  private readonly POLICY_NAME = "global_kill_switch_threshold";

  constructor(
    @InjectRepository(RLPolicy)
    private policyRepo: Repository<RLPolicy>,
    @InjectRepository(RLExperience)
    private experienceRepo: Repository<RLExperience>,
    private redisService: RedisService,
  ) {}

  /**
   * Decides whether to adjust the current risk threshold based on system state
   */
  async runInference(currentState: {
    avgRisk: number;
    spikeVelocity: number;
    failureRate: number;
    suspensionCount: number;
  }) {
    let policy = await this.policyRepo.findOne({
      where: { name: this.POLICY_NAME },
    });
    if (!policy) {
      policy = await this.policyRepo.save(
        this.policyRepo.create({ name: this.POLICY_NAME }),
      );
    }

    // 1. Choose Action (Epsilon-Greedy)
    const action = await this.chooseAction(policy, currentState);

    // 2. Log Experience
    const experience = await this.experienceRepo.save(
      this.experienceRepo.create({
        state: currentState,
        action,
      }),
    );

    // 3. Apply Action
    await this.applyAction(policy, action);

    this.logger.log(
      `RL Decision: Action=${action}, New Threshold=${policy.currentThreshold}`,
    );

    return {
      threshold: Number(policy.currentThreshold),
      experienceId: experience.id,
    };
  }

  private async chooseAction(policy: RLPolicy, state: any): Promise<number> {
    const exploration = Math.random() < Number(policy.explorationRate);

    if (exploration) {
      return Math.floor(Math.random() * 3); // 0: Keep, 1: Tighten (-5), 2: Loosen (+5)
    }

    // Exploitation Logic (Simple Production Heuristic for Bandits)
    if (state.spikeVelocity > 5 || state.failureRate > 0.4) return 1; // Tighten if attack suspected
    if (state.avgRisk < 10 && state.suspensionCount === 0) return 2; // Loosen if very safe

    return 0; // Default: Keep
  }

  private async applyAction(policy: RLPolicy, action: number) {
    let delta = 0;
    if (action === 1) delta = -5;
    if (action === 2) delta = 5;

    if (delta !== 0) {
      policy.currentThreshold = Math.max(
        this.MIN_THRESHOLD,
        Math.min(this.MAX_THRESHOLD, Number(policy.currentThreshold) + delta),
      );
      await this.policyRepo.save(policy);

      // Update Redis for ultra-fast access by KillSwitchService
      await this.redisService.set(
        `config:security:threshold`,
        policy.currentThreshold.toString(),
        3600,
      );
    }
  }

  /**
   * Assign reward to a previous decision based on outcome
   */
  async recordReward(experienceId: string, rewardValue: number) {
    const experience = await this.experienceRepo.findOne({
      where: { id: experienceId },
    });
    if (experience) {
      experience.reward = rewardValue;
      experience.isProcessed = true;
      await this.experienceRepo.save(experience);
    }
  }
}
