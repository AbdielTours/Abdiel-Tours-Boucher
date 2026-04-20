import { useEffect } from "react";
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

// ✅ SCHEMA ORIGINAL + NACIONAL
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
  })).optional(),

  // 🔥 nacional
  hotel: z.string().optional(),
  room: z.string().optional(),
  meal: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function VoucherFormPage() {

  const [, params] = useRoute("/vouchers/:id/edit");
  const isEdit = !!params?.id;
  const voucherId = isEdit ? parseInt(params.id) : null;

  const [location, setLocation] = useLocation();

  // 🔥 detectar tipo
  const paramsUrl = new URLSearchParams(location.split("?")[1]);
  const type = paramsUrl.get("type") || "internacional";

  const { toast } = useToast();
  const { data: voucher, isLoading } = useVoucher(voucherId);
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
      form.reset(voucher);
    }
  }, [voucher]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        services: data.services?.map(s => ({
          title: s.title,
          items: s.items.map(i => i.value)
        }))
      };

      const created = await createMutation.mutateAsync(payload);

      window.location.href = `/vouchers/${created.id}`;
    } catch (error) {
      toast({
        title: "Error al guardar",
        variant: "destructive"
      });
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">

        <Link href="/" className="inline-flex items-center text-muted-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        <PageHeader 
          title="Crear Nuevo Voucher"
          description={`Tipo: ${type}`}
        />

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* INFO HUÉSPED */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/60">
            <h2 className="text-xl font-display font-semibold mb-6">
              Información del Huésped
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <input {...form.register("guestName")} placeholder="Nombre del huésped"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
              />

              <input {...form.register("destination")} placeholder="Destino"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
              />

              <input {...form.register("country")} placeholder="País"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
              />

              <input {...form.register("stayDates")} placeholder="Fechas"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
              />

            </div>
          </div>

          {/* ✈️ INTERNACIONAL */}
          {type === "internacional" && (
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/60">

              <h2 className="text-xl font-display font-semibold mb-6">
                Servicios Incluidos
              </h2>

              {serviceFields.map((field, index) => (
                <div key={field.id} className="mb-4">

                  <input 
                    {...form.register(`services.${index}.title`)}
                    className="w-full px-4 py-2.5 rounded-lg bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                  />

                </div>
              ))}

              <button
                type="button"
                onClick={() => appendService({ title: "", items: [{ value: "" }] })}
                className="mt-4 text-primary"
              >
                + Agregar servicio
              </button>

            </div>
          )}

          {/* 🏨 NACIONAL */}
          {type === "nacional" && (
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/60">

              <h2 className="text-xl font-display font-semibold mb-6">
                Información del Hotel
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <input {...form.register("hotel")} placeholder="Nombre del hotel"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                />

                <input {...form.register("room")} placeholder="Habitación"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                />

                <input {...form.register("meal")} placeholder="Plan"
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                />

              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-primary text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Voucher
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}