import { vouchers, type Voucher, type InsertVoucher } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getVouchers(): Promise<Voucher[]>;
  getVoucher(id: number): Promise<Voucher | undefined>;
  createVoucher(voucher: InsertVoucher): Promise<Voucher>;
  updateVoucher(id: number, updates: Partial<InsertVoucher>): Promise<Voucher>;
  deleteVoucher(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getVouchers(): Promise<Voucher[]> {
    return await db.select().from(vouchers).orderBy(vouchers.id);
  }

  async getVoucher(id: number): Promise<Voucher | undefined> {
    const [voucher] = await db.select().from(vouchers).where(eq(vouchers.id, id));
    return voucher;
  }

  async createVoucher(insertVoucher: InsertVoucher): Promise<Voucher> {
    const [voucher] = await db.insert(vouchers).values(insertVoucher).returning();
    return voucher;
  }

  async updateVoucher(id: number, updates: Partial<InsertVoucher>): Promise<Voucher> {
    const [updated] = await db.update(vouchers)
      .set(updates)
      .where(eq(vouchers.id, id))
      .returning();
    return updated;
  }

  async deleteVoucher(id: number): Promise<void> {
    await db.delete(vouchers).where(eq(vouchers.id, id));
  }
}

export const storage = new DatabaseStorage();
