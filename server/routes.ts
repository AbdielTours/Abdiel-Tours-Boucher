import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET ALL
  app.get(api.vouchers.list.path, async (req, res) => {
    try {
      const vouchers = await storage.getVouchers();
      res.json(vouchers);
    } catch (err) {
      console.error("Error getting vouchers:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GET ONE
  app.get(api.vouchers.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const voucher = await storage.getVoucher(id);
      if (!voucher) {
        return res.status(404).json({ message: "Voucher not found" });
      }
      res.json(voucher);
    } catch (err) {
      console.error("Error getting voucher:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // CREATE (🔥 FIX AQUI)
  app.post(api.vouchers.create.path, async (req, res) => {
    try {
      const data = req.body;

      const payload = {
        guestName: data.guestName || "",
        guestNames: data.guestNames || [],

        destination: data.destination || "",
        country: data.country || "",

        guestCount: Number(data.guestCount) || 1,

        stayDates: data.stayDates || "",

        checkIn: data.checkIn || "",
        checkOut: data.checkOut || "",

        locator: data.locator || "",
        phone: data.phone || "",
        plan: data.plan || "",
        category: data.category || "",

        services: data.services || [],
      };

      const voucher = await storage.createVoucher(payload);

      res.status(201).json(voucher);
    } catch (err) {
      console.error("Error creating voucher:", err);
      res.status(500).json({ message: "Error creating voucher" });
    }
  });

  // UPDATE (🔥 TAMBIEN FIX)
  app.put(api.vouchers.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const existing = await storage.getVoucher(id);
      if (!existing) {
        return res.status(404).json({ message: "Voucher not found" });
      }

      const data = req.body;

      const payload = {
        guestName: data.guestName || "",
        guestNames: data.guestNames || [],

        destination: data.destination || "",
        country: data.country || "",

        guestCount: Number(data.guestCount) || 1,

        stayDates: data.stayDates || "",

        checkIn: data.checkIn || "",
        checkOut: data.checkOut || "",

        locator: data.locator || "",
        phone: data.phone || "",
        plan: data.plan || "",
        category: data.category || "",

        services: data.services || [],
      };

      const voucher = await storage.updateVoucher(id, payload);

      res.json(voucher);
    } catch (err) {
      console.error("Error updating voucher:", err);
      res.status(500).json({ message: "Error updating voucher" });
    }
  });

  // DELETE
  app.delete(api.vouchers.delete.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const existing = await storage.getVoucher(id);
      if (!existing) {
        return res.status(404).json({ message: "Voucher not found" });
      }

      await storage.deleteVoucher(id);
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting voucher:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  setTimeout(seedDatabase, 1000);

  return httpServer;
}

// SEED
async function seedDatabase() {
  try {
    const existing = await storage.getVouchers();
    if (existing.length === 0) {
      await storage.createVoucher({
        guestName: "JOEL MARTINEZ\nDILENIA ANTONIA ROJAS",
        destination: "MEDELLIN",
        country: "COLOMBIA",
        guestCount: 2,
        stayDates: "DEL 17 AL 21 MARZO",
        locator: "",
        phone: "",
        plan: "",
        category: "",
        services: [],
      });
      console.log("Database seeded");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}