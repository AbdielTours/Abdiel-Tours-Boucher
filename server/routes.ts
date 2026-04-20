import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.vouchers.list.path, async (req, res) => {
    try {
      const vouchers = await storage.getVouchers();
      res.json(vouchers);
    } catch (err) {
      console.error("Error getting vouchers:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

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

  app.post(api.vouchers.create.path, async (req, res) => {
    try {
      const input = api.vouchers.create.input.parse(req.body);
      const voucher = await storage.createVoucher(input);
      res.status(201).json(voucher);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error creating voucher:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

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

      const input = api.vouchers.update.input.parse(req.body);
      const voucher = await storage.updateVoucher(id, input);
      res.json(voucher);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error updating voucher:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

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

  // Seed database if empty
  setTimeout(seedDatabase, 1000);

  return httpServer;
}

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
        services: [
          {
            title: "1- TRASLADO AEROPUERTO HOTEL- IDA Y REGRESO",
            items: []
          },
          {
            title: "2- FIESTA ENCHIVA RUMBERA (1 NOCHE) TOURS NOCTURNO",
            items: [
              "RECORRIDO POR LA CARRERA 70",
              "PARQUE DEL POBLADO",
              "PARQUE LLERAS",
              "MIRADOR DE LAS PALMAS",
              "GUIA ACOMPANANTE",
              "ASISTENCIA MEDICA",
              "TRASPORTE",
              "DURACION 4 HORAS",
              "SALIDA DE LA CARRERA 70: HORA 7PM"
            ]
          },
          {
            title: "3- City tour más comuna 13",
            items: [
              "Transporte ida y regreso",
              "Plaza Botero",
              "Parque de los pies descalzos",
              "Pueblito paisa (cerro Nutibara).",
              "Transporte en Metro y Metrocable.",
              "Recorrido escaleras eléctricas comuna 13."
            ]
          }
        ]
      });
      console.log("Database seeded with sample voucher");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
