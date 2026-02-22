import { DataSource } from "typeorm";
import { config } from "dotenv";
import { join } from "path";

config({ path: join(__dirname, "../../.env") });

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [
    join(__dirname, "/entities/**/*.entity{.ts,.js}"),
    join(__dirname, "../../api-service/**/*.entity{.ts,.js}"),
    join(__dirname, "../../webhook-service/**/*.entity{.ts,.js}"),
    join(__dirname, "../../worker-service/**/*.entity{.ts,.js}"),
  ],
  migrations: [join(__dirname, "/migrations/*{.ts,.js}")],
  subscribers: [],
});
