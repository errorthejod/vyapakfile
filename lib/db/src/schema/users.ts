import { pgTable, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("bb_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  businessName: text("business_name").notNull(),
  pin: text("pin").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminConfigTable = pgTable("bb_admin_config", {
  id: integer("id").primaryKey().default(1),
  adminPassword: text("admin_password").notNull().default("delhi5932"),
  nextUserNum: integer("next_user_num").notNull().default(2),
});

export const insertUserSchema = createInsertSchema(usersTable);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DbUser = typeof usersTable.$inferSelect;
