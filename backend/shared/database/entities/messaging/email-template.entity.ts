import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Tenant } from "../core/tenant.entity";

@Entity("email_templates")
export class EmailTemplate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: "tenant_id", type: "uuid" })
    @Index()
    tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
    @JoinColumn({ name: "tenant_id" })
    tenant: Tenant;

    @Column()
    name: string;

    @Column()
    subject: string;

    @Column({ type: "text" })
    content: string; // HTML content

    @Column({ type: "jsonb", nullable: true })
    variables: string[]; // List of variable names used in the template

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
