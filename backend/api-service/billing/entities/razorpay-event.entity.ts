import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("razorpay_events")
export class RazorpayEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @Index()
  eventId: string; // Razorpay's x-razorpay-event-id

  @Column()
  event: string; // The event name (e.g. subscription.activated)

  @Column("jsonb", { nullable: true })
  payload: any;

  @Column({ nullable: true })
  status: string; // processed, failed, ignored

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
