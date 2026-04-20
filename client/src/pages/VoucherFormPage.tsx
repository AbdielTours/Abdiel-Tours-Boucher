import { useRoute, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

// 🔥 Schema actualizado
const formSchema = z.object({
  type: z.string().optional(),
  guestName: z.string().min(2),
  destination: z.string().min(2),
  country: z.string().min(2),
  guestCount: z.coerce.number().min(1),
  stayDates: z.string().min(2),

  // internacional
  services: z.array(z.object({
    title: z.string(),
    items: z.array(z.object({
      value: z.string()
    }))
  })).optional(),

  // nacional
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

  // 🔥 LEER TYPE DESDE URL
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const typeFromUrl = searchParams.get("type") || "internacional";

  const { toast } = useToast();
  const { data: voucher, isLoading } = useVoucher(voucherId);
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: typeFromUrl,
      guestName: "",
      destination: "",
      country: "",
      guestCount: 1,
      stayDates: "",
      services: [{ title: "1- TRASLADOS", items: [{ value: "" }] }]
    }
  });

  const type = form.watch("type");

  const { fields, append, remove } = useFieldArray({
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

      queryClient.invalidateQueries({ queryKey: ["vouchers"] });

      window.location.href = `/vouchers/${created.id}`;
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (isEdit && isLoading) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/">← Volver</Link>

      <PageHeader 
        title="Crear Voucher"
        description={`Tipo: ${type}`}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* INFO GENERAL */}
        <input {...form.register("guestName")} placeholder="Nombre" />
        <input {...form.register("destination")} placeholder="Destino" />
        <input {...form.register("country")} placeholder="País" />
        <input {...form.register("stayDates")} placeholder="Fechas" />

        {/* ✈️ INTERNACIONAL */}
        {type === "internacional" && (
          <div>
            <h3>Servicios</h3>

            {fields.map((field, i) => (
              <div key={field.id}>
                <input {...form.register(`services.${i}.title`)} />

                {field.items?.map((_, j) => (
                  <input {...form.register(`services.${i}.items.${j}.value`)} />
                ))}

                <button type="button" onClick={() => remove(i)}>Eliminar</button>
              </div>
            ))}

            <button type="button" onClick={() => append({ title: "", items: [{ value: "" }] })}>
              Agregar
            </button>
          </div>
        )}

        {/* 🏨 NACIONAL */}
        {type === "nacional" && (
          <div>
            <h3>Hotel</h3>
            <input {...form.register("hotel")} placeholder="Nombre del hotel" />
            <input {...form.register("room")} placeholder="Habitación" />
            <input {...form.register("meal")} placeholder="Plan" />
          </div>
        )}

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}