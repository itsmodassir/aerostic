import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, In } from "typeorm";
import { Order } from "@shared/database/entities/commerce/order.entity";
import { OrderItem } from "@shared/database/entities/commerce/order-item.entity";
import { CatalogProduct } from "@shared/database/entities/commerce/catalog-product.entity";
import { CommerceCatalog } from "@shared/database/entities/commerce/commerce-catalog.entity";
import { WhatsappService } from "@shared/whatsapp/whatsapp.service";

@Injectable()
export class CommerceService {
  private readonly logger = {
    log: (msg: string) => console.log(`[CommerceService] ${msg}`),
    error: (msg: string) => console.error(`[CommerceService] ${msg}`),
  };

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(CatalogProduct)
    private productRepo: Repository<CatalogProduct>,
    @InjectRepository(CommerceCatalog)
    private catalogRepo: Repository<CommerceCatalog>,
    private whatsappService: WhatsappService,
  ) {}

  // --- Products ---

  async getProducts(tenantId: string) {
    return this.productRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  async createProduct(tenantId: string, data: any) {
    let catalogId = data.catalogId;
    
    // Auto-resolve catalog if missing
    if (!catalogId) {
      const defaultCatalog = await this.catalogRepo.findOne({ where: { tenantId, isDefault: true } });
      if (defaultCatalog) catalogId = defaultCatalog.metaCatalogId;
    }

    const product = this.productRepo.create({
      ...data,
      tenantId,
      catalogId,
      retailerId: data.retailerId || `prod_${Date.now()}`,
    });
    return this.productRepo.save(product);
  }

  async updateProduct(id: string, tenantId: string, data: any) {
    const product = await this.productRepo.findOne({ where: { id, tenantId } });
    if (!product) throw new NotFoundException("Product not found");
    
    Object.assign(product, data);
    return this.productRepo.save(product);
  }

  async deleteProduct(id: string, tenantId: string) {
    const product = await this.productRepo.findOne({ where: { id, tenantId } });
    if (!product) throw new NotFoundException("Product not found");
    
    if (product.retailerId) {
      await this.whatsappService.deleteMetaProduct(tenantId, product.retailerId).catch((err: any) => {
        this.logger.log(`Failed to delete product from Meta: ${err.message}`);
      });
    }
    
    return this.productRepo.remove(product);
  }

  async publishToMeta(id: string, tenantId: string) {
    const product = await this.productRepo.findOne({ where: { id, tenantId } });
    if (!product) throw new NotFoundException("Product not found");

    const response = await this.whatsappService.pushMetaProduct(tenantId, product);
    
    // If Meta returns a product ID, store it
    if (response && response.id) {
      product.metaProductId = response.id;
      product.metadata = { ...product.metadata, metaResponse: response };
      await this.productRepo.save(product);
    }

    return { success: true, metaId: response.id };
  }

  async findAll(tenantId: string) {
    return this.orderRepo.find({
      where: { tenantId },
      relations: ["items", "contact"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string, tenantId: string) {
    const order = await this.orderRepo.findOne({
      where: { id, tenantId },
      relations: ["items", "contact"],
    });
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    const order = await this.findOne(id, tenantId);
    order.status = status;
    return this.orderRepo.save(order);
  }

  async generatePaymentLink(id: string, tenantId: string) {
    const order = await this.findOne(id, tenantId);
    
    // Placeholder logic for Razorpay Link.
    const paymentLink = `https://rzp.io/i/mock_link_${order.id}`;
    
    order.paymentStatus = "link_sent";
    order.metadata = { ...order.metadata, paymentLink };
    await this.orderRepo.save(order);

    return { paymentLink };
  }

  // --- Batch Saving ---

  async batchSaveProducts(tenantId: string, items: any[], bodyCatalogId?: string) {
    // Resolve default catalog if needed
    let catalogId = bodyCatalogId;
    if (!catalogId) {
      const defaultCatalog = await this.catalogRepo.findOne({ where: { tenantId, isDefault: true } });
      if (defaultCatalog) catalogId = defaultCatalog.id;
    }

    const products = items.map(item => this.productRepo.create({
      ...item,
      tenantId,
      catalogId: item.catalogId || catalogId,
      retailerId: item.retailerId || `prod_${Math.random().toString(36).substr(2, 9)}`,
    }));
    
    return this.productRepo.save(products as any);
  }

  // --- Catalogs ---

  async getCatalogs(tenantId: string) {
    return this.catalogRepo.find({ where: { tenantId } });
  }

  async createCatalog(tenantId: string, name: string, vertical: string) {
    // 1. Create in Meta
    const metaResponse = await this.whatsappService.createMetaCatalog(tenantId, name, vertical);

    // 2. Save locally
    const catalog = this.catalogRepo.create({
      tenantId,
      name,
      vertical,
      metaCatalogId: metaResponse.id,
      isDefault: (await this.catalogRepo.count({ where: { tenantId } })) === 0,
    });

    return this.catalogRepo.save(catalog);
  }

  // --- Commerce Settings ---

  async getPortfolios(tenantId: string) {
    return this.whatsappService.getBusinessPortfolios(tenantId);
  }

  async updateSettings(tenantId: string, settings: any) {
    const response = await this.whatsappService.updateCommerceSettings(tenantId, settings);
    
    // If a catalog was linked, mark it as default locally if it exists
    if (settings.catalog_id) {
        await this.catalogRepo.update({ tenantId, metaCatalogId: settings.catalog_id }, { isDefault: true });
        // Unmark others
        await this.catalogRepo.update({ tenantId, metaCatalogId: Not(settings.catalog_id) }, { isDefault: false });
    }

    return response;
  }

  // --- Batch Operations ---

  async syncBatchToMeta(tenantId: string, catalogId: string, productIds: string[]) {
    const products = await this.productRepo.find({ where: { id: In(productIds) } });
    
    const requests = products.map(p => ({
        method: "UPDATE",
        retailer_id: p.retailerId,
        data: {
            name: p.name,
            description: p.description,
            price: Math.round(p.price * 100),
            currency: p.currency,
            image_url: p.imageUrl,
            brand: p.brand,
            url: p.url,
            condition: p.condition,
            availability: p.availability ? "in stock" : "out of stock"
        }
    }));

    return this.whatsappService.pushItemsBatch(tenantId, catalogId, requests);
  }
}
