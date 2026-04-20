import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVoucher, useCreateVoucher, useUpdateVoucher } from "@/hooks/use-vouchers";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Save,
  PlusCircle,
  Trash2,
  GripVertical,
  Loader2
} from "lucide-react";

const formSchema = z.object({
  guestName: z.string().min(2),
  destination: z.string().min(2),
  country: z.string().min(2),
  guestCount: z.coerce.number().min(1),
  stayDates: z.string().min(2),
  services: z.array(z.object({
    title: z.string(),
    items: z.array(z.object({
      value: z.string()
    }))
  }))
});

type FormValues = z.infer<typeof formSchema>;

export default function VoucherFormPage() {
  const queryClient = useQueryClient();

  const [, params] = useRoute("/vouchers/:id/edit");
  const isEdit = !!params?.id;
  const voucherId = isEdit ? parseInt(params.id) : null;

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: voucher, isLoading: isLoadingVoucher } = useVoucher(voucherId);
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();

  // 🔥 Tipo (nacional / internacional)
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("type");
    setType(t);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: "",
      destination: "",
      country: "",
      guestCount: 1,
      stayDates: "",
      services: [{ title: "1- TRASLADOS", items: [{ value: "" }] }]
    }
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services"
  });

  // 🔥 Si es nacional cambia automáticamente
  useEffect(() => {
    if (!type) return;

    if (type === "nacional") {
      form.setValue("services", [
        {
          title: "1- HOTEL",
          items: [{ value: "Alojamiento incluido" }]
        }
      ]);
    }
  }, [type]);

  // Edit mode
  useEffect(() => {
    if (voucher && isEdit) {
      form.reset({
        guestName: voucher.guestName,
        destination: voucher.destination,
        country: voucher.country,
        guestCount: voucher.guestCount,
        stayDates: voucher.stayDates,
        services: voucher.services.map((s: any) => ({
          title: s.title,
          items: s.items.map((item: string) => ({ value: item }))
        }))
      });
    }
  }, [voucher, isEdit, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        services: data.services.map(s => ({
          title: s.title,
          items: s.items.map(i => i.value)
        }))
      };

      if (isEdit && voucherId) {
        await updateMutation.mutateAsync({ id: voucherId, ...payload });
        toast({ title: "Voucher actualizado" });
      } else {
        const created = await createMutation.mutateAsync(payload);
        queryClient.invalidateQueries({ queryKey: ["vouchers"] });
        window.location.href = `/vouchers/${created.id}`;
        return;
      }

      setLocation("/");
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingVoucher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        <PageHeader
          title={isEdit ? "Editar Voucher" : "Crear Nuevo Voucher"}
          description={`Tipo: ${type === "nacional" ? "Nacional 🇩🇴" : "Internacional ✈️"}`}
        />

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Información del huésped */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/60">
            <h2 className="text-xl font-semibold mb-6">Información del Huésped</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nombre</label>
                <input {...form.register("guestName")} className="w-full px-4 py-3 border rounded-xl" />
              </div>

              <div>
                <label className="text-sm font-medium">Destino</label>
                <input {...form.register("destination")} className="w-full px-4 py-3 border rounded-xl" />
              </div>

              <div>
                <label className="text-sm font-medium">País</label>
                <input {...form.register("country")} className="w-full px-4 py-3 border rounded-xl" />
              </div>

              <div>
                <label className="text-sm font-medium">Cantidad</label>
                <input type="number" {...form.register("guestCount")} className="w-full px-4 py-3 border rounded-xl" />
              </div>

              <div>
                <label className="text-sm font-medium">Fechas</label>
                <input {...form.register("stayDates")} className="w-full px-4 py-3 border rounded-xl" />
              </div>

            </div>
          </div>

          {/* Servicios */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/60">
            <h2 className="text-xl font-semibold mb-6">Servicios</h2>

            {serviceFields.map((field, index) => (
              <div key={field.id} className="mb-4">

                <input
                  {...form.register(`services.${index}.title`)}
                  className="w-full px-4 py-2 border rounded-lg mb-2"
                />

                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="text-red-500 text-sm mb-2"
                >
                  Eliminar
                </button>

              </div>
            ))}

            <button
              type="button"
              onClick={() => appendService({ title: "", items: [{ value: "" }] })}
              className="text-blue-600"
            >
              + Agregar servicio
            </button>
          </div>

          {/* Botón */}
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl">
              {isEdit ? "Guardar Cambios" : "Crear Voucher"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}