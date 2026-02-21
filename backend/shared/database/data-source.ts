import { DataSource } from "typeorm";
import { config } from "dotenv";
import { join } from "path";

config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [join(__dirname, "/entities/**/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "/migrations/*{.ts,.js}")],
  subscribers: [],
});
