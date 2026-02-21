import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Tenant } from "@shared/database/entities/core/tenant.entity";

@Entity("invoices")
export class Invoice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column()
  amount: number; // Stored in INR (e.g., 999.00)

  @Column()
  status: string; // 'paid', 'pending', 'failed'

  @Column({ name: "invoice_date", type: "date" })
  date: Date;

  @Column({ name: "pdf_url", nullable: true })
  pdfUrl?: string;

  @Column({ name: "razorpay_payment_id", nullable: true })
  razorpayPaymentId?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
