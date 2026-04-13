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
import { CommerceCatalog } from "./commerce-catalog.entity";

@Entity("catalog_products")
@Index(["tenantId", "retailerId"], { unique: true })
export class CatalogProduct {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  tenant: Tenant;

  @Column({ name: "retailer_id" })
  @Index()
  retailerId: string; // The ID from Meta Commerce Manager

  @Column({ name: "meta_product_id", nullable: true })
  metaProductId: string;

  @Column({ name: "catalog_id", type: "uuid", nullable: true })
  catalogId: string;

  @ManyToOne(() => CommerceCatalog, (catalog) => catalog.products, { onDelete: "SET NULL" })
  @JoinColumn({ name: "catalog_id" })
  catalog: CommerceCatalog;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ default: "INR" })
  currency: string;

  @Column({ name: "sale_price", type: "decimal", precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ name: "image_url", type: "text", nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  category: string;

  @Column({ name: "facebook_category", nullable: true })
  facebookCategory: string;

  @Column({ name: "content_id", nullable: true })
  contentId: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true, type: "text" })
  url: string;

  @Column({ default: "new" })
  condition: string; // 'new' | 'refurbished' | 'used'

  @Column({ default: true })
  availability: boolean;

  @Column({ default: "active" })
  status: string; // active, archived

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parentId: string;

  @ManyToOne(() => CatalogProduct, (product) => product.variants, { onDelete: "CASCADE" })
  @JoinColumn({ name: "parent_id" })
  parent: CatalogProduct;

  @OneToMany(() => CatalogProduct, (product) => product.parent)
  variants: CatalogProduct[];

  @Column({ name: "is_variant", default: false })
  isVariant: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
