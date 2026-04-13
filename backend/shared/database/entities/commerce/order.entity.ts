import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from "typeorm";
import { Tenant } from "../core/tenant.entity";
import { Contact } from "../core/contact.entity";
import { OrderItem } from "./order-item.entity";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne("Tenant", { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "contact_id", type: "uuid" })
  @Index()
  contactId: string;

  @ManyToOne("Contact", { onDelete: "CASCADE" })
  @JoinColumn({ name: "contact_id" })
  contact: Contact;

  @Column({ name: "external_order_id", nullable: true })
  @Index()
  externalOrderId: string; // Meta Order ID

  @Column({ name: "catalog_id", nullable: true })
  @Index()
  catalogId: string;

  @Column({ default: "whatsapp" })
  @Index()
  source: string;

  @Column({ default: "new" })
  status: string; // new, confirmed, paid, shipped, delivered, cancelled

  @Column({ name: "payment_status", default: "pending" })
  paymentStatus: string; // pending, paid, failed, refunded

  @Column({ name: "payment_mode", default: "cod" })
  paymentMode: string; // cod, payment_link, manual

  @Column({ type: "decimal", precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ default: "INR" })
  currency: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @OneToMany("OrderItem", "order", { cascade: true })
  items: any[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
