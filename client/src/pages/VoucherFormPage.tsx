import { useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
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

// ✅ SCHEMA (AGREGAMOS NACIONAL SIN DAÑAR INTERNACIONAL)
const formSchema = z.object({
  guestName: z.string().min(2, "El nombre es requerido"),
  destination: z.string().min(2, "El destino es requerido"),
  country: z.string().min(2, "El país es requerido"),
  guestCount: z.coerce.number().min(1, "Debe ser al menos 1 huésped"),
  stayDates: z.string().min(2, "Las fechas son requeridas"),

  services: z.array(z.object({
    title: z.string().min(1),
    items: z.array(z.object({
      value: z.string().min(1)
    }))
  })).optional(),

  // 🔥 NUEVO
  hotel: z.string().optional(),
  room: z.string().optional(),
  meal: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function VoucherFormPage() {

  const queryClient = useQueryClient();

  const [, params] = useRoute("/vouchers/:id/edit");
  const isEdit = !!params?.id;
  const voucherId = isEdit ? parseInt(params.id) : null;

  const [location, setLocation] = useLocation();

  // 🔥 DETECTAR TIPO
  const paramsUrl = new URLSearchParams(location.split("?")[1]);
  const type = paramsUrl.get("type") || "internacional";

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
      hotel: "",
      room: "",
      meal: "",
      services: [{ title: "1- TRASLADOS", items: [{ value: "" }] }]
    }
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services"
  });

  useEffect(() => {
    if (voucher && isEdit) {
      form.reset({
        ...voucher,
        services: voucher.services?.map((s: any) => ({
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
        services: data.services?.map(s => ({
          title: s.title,
          items: s.items.map(i => i.value)
        }))
      };

      if (isEdit && voucherId) {
        await updateMutation.mutateAsync({ id: voucherId, ...payload });
        toast({ title: "Voucher actualizado con éxito" });
      } else {
        const created = await createMutation.mutateAsync(payload);

        queryClient.invalidateQueries({ queryKey: ["vouchers"] });

        window.location.href = `/vouchers/${created.id}`;
        return;
      }

      setLocation("/");
    } catch (error) {
      toast({
        title: "Error al guardar",
        variant: "destructive"
      });
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
          description={`Tipo: ${type}`}
        />

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* 🧍 INFO HUÉSPED (NO TOCADO) */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/60">
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
              Información del Huésped
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Nombre del Huésped</label>
                <input {...form.register("guestName")}
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                />
              </div>

              <input {...form.register("destination")} placeholder="Destino"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 outline-none"
              />

              <input {...form.register("country")} placeholder="País"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 outline-none"
              />

              <input type="number" {...form.register("guestCount")}
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border"
              />

              <input {...form.register("stayDates")} placeholder="Fechas"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border"
              />

            </div>
          </div>

          {/* ✈️ INTERNACIONAL */}
          {type === "internacional" && (
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/60">

              <h2 className="text-xl font-display font-semibold mb-6">
                Servicios Incluidos
              </h2>

              {serviceFields.map((field, index) => (
                <div key={field.id} className="mb-4">

                  <input {...form.register(`services.${index}.title`)}
                    className="w-full px-4 py-2 rounded-lg border"
                  />

                </div>
              ))}

              <button type="button" onClick={() => appendService({ title: "", items: [{ value: "" }] })}>
                + Agregar servicio
              </button>

            </div>
          )}

          {/* 🏨 NACIONAL */}
          {type === "nacional" && (
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/60">

              <h2 className="text-xl font-display font-semibold mb-6">
                Información del Hotel
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <input {...form.register("hotel")} placeholder="Hotel"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border"
                />

                <input {...form.register("room")} placeholder="Habitación"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border"
                />

                <input {...form.register("meal")} placeholder="Plan"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border"
                />

              </div>

            </div>
          )}

          <div className="flex justify-end">
            <button type="submit"
              className="px-6 py-3 bg-primary text-white rounded-xl flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}