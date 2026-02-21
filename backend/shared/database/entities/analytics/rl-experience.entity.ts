import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("rl_experiences")
export class RLExperience {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "jsonb" })
  state: any; // State vector at time of decision

  @Column({ type: "integer" })
  action: number; // Action taken ID

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  reward: number; // Outcome reward (assigned later)

  @Column({ name: "is_processed", default: false })
  @Index()
  isProcessed: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
