import { pgTable, text, serial, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  destination: text("destination").notNull(),
  country: text("country").notNull(),
  guestCount: integer("guest_count").notNull(),
  stayDates: text("stay_dates").notNull(),
  services: json("services").notNull().$type<Array<{ title: string; items: string[] }>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({ 
  id: true, 
  createdAt: true 
});

export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type VoucherResponse = Voucher;
export type VouchersListResponse = Voucher[];
