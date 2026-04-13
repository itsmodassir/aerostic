/** Commerce Module for Order Management */
/** Trigger re-index */
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "@shared/database/entities/commerce/order.entity";
import { OrderItem } from "@shared/database/entities/commerce/order-item.entity";
import { CatalogProduct } from "@shared/database/entities/commerce/catalog-product.entity";
import { CommerceController } from "@api/commerce/commerce.controller";
import { CommerceService } from "@api/commerce/commerce.service";
import { WhatsappModule } from "@shared/whatsapp/whatsapp.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      CatalogProduct,
    ]),
    WhatsappModule,
  ],
  controllers: [CommerceController],
  providers: [CommerceService],
  exports: [CommerceService],
})
export class CommerceModule {}
