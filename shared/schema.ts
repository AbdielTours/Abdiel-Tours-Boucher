import { pgTable, text, serial, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),

  guestName: text("guest_name").notNull(),
  guestNames: json("guest_names").$type<string[]>(), // 👈 NUEVO

  destination: text("destination").notNull(),
  country: text("country").notNull(),

  guestCount: integer("guest_count").notNull(),

  stayDates: text("stay_dates").notNull(),

  checkIn: text("check_in"),     // 👈 NUEVO
  checkOut: text("check_out"),   // 👈 NUEVO

  locator: text("locator"),      // 👈 NUEVO
  phone: text("phone"),          // 👈 NUEVO
  plan: text("plan"),            // 👈 NUEVO
  category: text("category"),    // 👈 NUEVO

  services: json("services").notNull().$type<Array<{ title: string; items: string[] }>>(),

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  createdAt: true,
});

export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
