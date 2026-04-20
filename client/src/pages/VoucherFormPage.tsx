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

  // ✅ TYPE SEGURO (NO ROMPE RENDER)
  const [type, setType] = useState<string | null>(null);

  const { toast } = useToast();
  
  const { data: voucher, isLoading: isLoadingVoucher } = useVoucher(voucherId);
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: "",
      destination: "",
      country: "",
      guestCount: 1,
      stayDates: "",
      services: [
        {
          title: "1- TRASLADOS",
          items: [{ value: "" }]
        }
      ]
    }
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services"
  });

  // 🔥 Detectar tipo seguro
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get("type");
      setType(t);
    }
  }, []);

  // 🔥 Aplicar cambios según tipo
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
  }, [voucher, isEdit]);

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
        toast({ title: "Actualizado" });
      } else {
        const created = await createMutation.mutateAsync(payload);
        queryClient.invalidateQueries({ queryKey: ["vouchers"] });
        window.location.href = `/vouchers/${created.id}`;
        return;
      }

      setLocation("/");
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (isEdit && isLoadingVoucher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <PageHeader title="Crear Voucher" description={`Tipo: ${type || "internacional"}`} />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <input {...form.register("guestName")} placeholder="Nombre" />
        <input {...form.register("destination")} placeholder="Destino" />
        <input {...form.register("country")} placeholder="País" />

        {serviceFields.map((field, index) => (
          <div key={field.id}>
            <input {...form.register(`services.${index}.title`)} />
          </div>
        ))}

        <button type="submit">Guardar</button>

      </form>
    </div>
  );
}