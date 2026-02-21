import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDefaultPolicies1710000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed default policies for standard roles

    const policies = [
      // SUPER_ADMIN: Absolute Power
      {
        subjectType: "role",
        subject: "super_admin",
        resource: "*",
        actions: ["*"],
        isActive: true,
      },

      // PLATFORM_ADMIN: Manage everything
      {
        subjectType: "role",
        subject: "platform_admin",
        resource: "*",
        actions: ["*"],
        isActive: true,
      },

      // TENANT_ADMIN: Manage all resources within their tenant
      {
        subjectType: "role",
        subject: "tenant_admin",
        resource: "campaign",
        actions: ["*"],
        isActive: true,
      },
      {
        subjectType: "role",
        subject: "tenant_admin",
        resource: "apiKey",
        actions: ["*"],
        isActive: true,
      },
      {
        subjectType: "role",
        subject: "tenant_admin",
        resource: "user",
        actions: ["*"],
        isActive: true,
      },
      {
        subjectType: "role",
        subject: "tenant_admin",
        resource: "message",
        actions: ["*"],
        isActive: true,
      },
      {
        subjectType: "role",
        subject: "tenant_admin",
        resource: "contact",
        actions: ["*"],
        isActive: true,
      },
      {
        subjectType: "role",
        subject: "tenant_admin",
        resource: "billing",
        actions: ["read"],
        isActive: true,
      },

      // AGENT: Basic operational access
      {
        subjectType: "role",
        subject: "agent",
        resource: "message",
        actions: ["*"],
        isActive: true,
      },
      {
        subjectType: "role",
        subject: "agent",
        resource: "contact",
        actions: ["*"],
        isActive: true,
      },
      {
        subjectType: "role",
        subject: "agent",
        resource: "campaign",
        actions: ["read"],
        isActive: true,
      },
    ];

    // Check if policies table exists before seeding
    const hasTable = await queryRunner.hasTable("policies");
    if (!hasTable) {
      console.warn("Policies table missing, skipping SeedDefaultPolicies");
      return;
    }

    for (const policy of policies) {
      await queryRunner.query(`
                INSERT INTO "policies" 
                ("subject_type", "subject", "resource", "actions", "is_active") 
                VALUES ('${policy.subjectType}', '${policy.subject}', '${policy.resource}', '${policy.actions.join(",")}', ${policy.isActive})
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "policies"`);
  }
}
