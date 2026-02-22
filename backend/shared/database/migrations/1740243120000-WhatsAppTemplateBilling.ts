import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";

export class WhatsAppTemplateBilling1740243120000 implements MigrationInterface {
    name = 'WhatsAppTemplateBilling1740243120000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update Campaigns table
        await queryRunner.addColumns("campaigns", [
            new TableColumn({
                name: "delivered_count",
                type: "integer",
                default: 0,
            }),
            new TableColumn({
                name: "read_count",
                type: "integer",
                default: 0,
            }),
            new TableColumn({
                name: "total_cost",
                type: "decimal",
                precision: 10,
                scale: 2,
                default: 0,
            })
        ]);

        // Update Messages table
        await queryRunner.addColumn("messages", new TableColumn({
            name: "campaign_id",
            type: "uuid",
            isNullable: true,
        }));

        await queryRunner.createIndex("messages", new TableIndex({
            name: "IDX_MESSAGES_CAMPAIGN_ID",
            columnNames: ["campaign_id"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("messages", "IDX_MESSAGES_CAMPAIGN_ID");
        await queryRunner.dropColumn("messages", "campaign_id");

        await queryRunner.dropColumn("campaigns", "total_cost");
        await queryRunner.dropColumn("campaigns", "read_count");
        await queryRunner.dropColumn("campaigns", "delivered_count");
    }
}
