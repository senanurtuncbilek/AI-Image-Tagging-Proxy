import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";

export const sequelize = new Sequelize({
  database: "ai_tagging_db",
  dialect: "postgres",
  username: "postgres",
  password: process.env.DB_PASS || 'sena2002nur',
  host: "localhost",
  port: 5432,
  models: [User],
});
