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
import { CatalogProduct } from "./catalog-product.entity";

@Entity("commerce_catalogs")
export class CommerceCatalog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "meta_catalog_id", unique: true })
  @Index()
  metaCatalogId: string;

  @Column()
  name: string;

  @Column({ default: "COMMERCE" })
  vertical: string; // COMMERCE, LODGING, etc.

  @Column({ name: "business_portfolio_id", nullable: true })
  businessPortfolioId: string;

  @Column({ name: "is_default", default: false })
  isDefault: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @OneToMany(() => CatalogProduct, (product) => product.catalog)
  products: CatalogProduct[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
