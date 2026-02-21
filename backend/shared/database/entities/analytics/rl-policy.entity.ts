import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";

@Entity("rl_policies")
export class RLPolicy {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "policy_name", unique: true })
  name: string; // e.g., 'global_kill_switch_threshold'

  @Column({
    name: "current_threshold",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 80,
  })
  currentThreshold: number;

  @Column({
    name: "exploration_rate",
    type: "decimal",
    precision: 3,
    scale: 2,
    default: 0.1,
  })
  explorationRate: number; // ε-greedy exploration coefficient

  @Column({
    name: "learning_rate",
    type: "decimal",
    precision: 3,
    scale: 2,
    default: 0.05,
  })
  learningRate: number;

  @UpdateDateColumn({ name: "last_updated" })
  lastUpdated: Date;
}
