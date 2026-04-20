import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertVoucher, type Voucher } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw new Error(`Invalid response format for ${label}`);
  }
  return result.data;
}

export function useVouchers() {
  return useQuery({
    queryKey: [api.vouchers.list.path],
    queryFn: async () => {
      const res = await fetch(api.vouchers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Error al obtener los vouchers");
      const data = await res.json();
      return parseWithLogging(api.vouchers.list.responses[200], data, "vouchers.list");
    },
  });
}

export function useVoucher(id: number | null) {
  return useQuery({
    queryKey: [api.vouchers.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.vouchers.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Error al obtener el voucher");
      const data = await res.json();
      return parseWithLogging(api.vouchers.get.responses[200], data, "vouchers.get");
    },
    enabled: !!id,
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertVoucher) => {
      const validated = api.vouchers.create.input.parse(data);
      const res = await fetch(api.vouchers.create.path, {
        method: api.vouchers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al crear el voucher");
      const resultData = await res.json();
      return parseWithLogging(api.vouchers.create.responses[201], resultData, "vouchers.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vouchers.list.path] });
    },
  });
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertVoucher>) => {
      const validated = api.vouchers.update.input.parse(updates);
      const url = buildUrl(api.vouchers.update.path, { id });
      const res = await fetch(url, {
        method: api.vouchers.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al actualizar el voucher");
      const resultData = await res.json();
      return parseWithLogging(api.vouchers.update.responses[200], resultData, "vouchers.update");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.vouchers.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.vouchers.get.path, variables.id] });
    },
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.vouchers.delete.path, { id });
      const res = await fetch(url, {
        method: api.vouchers.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar el voucher");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vouchers.list.path] });
    },
  });
}
