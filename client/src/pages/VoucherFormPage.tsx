import { useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVoucher, useCreateVoucher, useUpdateVoucher } from "@/hooks/use-vouchers";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, PlusCircle, Trash2, Loader2, GripVertical } from "lucide-react";

// 🔥 detectar tipo
const type = new URLSearchParams(window.location.search).get("type");

// esquema
const formSchema = z.object({
  guestName: z.string().min(2),
  destination: z.string().min(2),
  country: z.string().min(2),
  guestCount: z.coerce.number().min(1),
  stayDates: z.string().min(2),
  services: z.array(
    z.object({
      title: z.string(),
      items: z.array(z.object({ value: z.string() }))
    })
  )
});

type FormValues = z.infer<typeof formSchema>;

export default function VoucherFormPage() {
  const [, params] = useRoute("/vouchers/:id/edit");
  const isEdit = !!params?.id;
  const voucherId = isEdit ? parseInt(params.id) : null;

  const [, setLocation] = useLocation();
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
      services:
        type === "nacional"
          ? [
              {
                title: "1- HOTEL",
                items: [{ value: "Alojamiento incluido" }]
              }
            ]
          : [
              {
                title: "1- TRASLADOS",
                items: [{ value: "" }]
              }
            ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services"
  });

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
          items: s.items.map((i: string) => ({ value: i }))
        }))
      });
    }
  }, [voucher]);

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
      } else {
        const created = await createMutation.mutateAsync(payload);
        setLocation(`/vouchers/${created.id}`);
        return;
      }

      setLocation("/");
    } catch {
      toast({ title: "Error guardando", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">

        <Link href="/" className="flex items-center text-muted-foreground mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Volver al Dashboard
        </Link>

        <PageHeader
          title="Crear Nuevo Voucher"
          description={`Tipo: ${type === "nacional" ? "Nacional 🇩🇴" : "Internacional ✈️"}`}
        />

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* INFO */}
          <div className="bg-card rounded-2xl p-6 shadow border">
            <h2 className="text-xl font-semibold mb-6">Información del Huésped</h2>

            <div className="grid gap-6">

              <input
                {...form.register("guestName")}
                placeholder="Ej. Juan Pérez"
                className="input"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input {...form.register("destination")} placeholder="Destino" className="input" />
                <input {...form.register("country")} placeholder="País" className="input" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input type="number" {...form.register("guestCount")} className="input" />
                <input {...form.register("stayDates")} placeholder="Fechas" className="input" />
              </div>

            </div>
          </div>

          {/* SERVICIOS */}
          <div className="bg-card rounded-2xl p-6 shadow border">
            <h2 className="text-xl font-semibold mb-6">Servicios Incluidos</h2>

            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-xl mb-4">

                <input
                  {...form.register(`services.${index}.title`)}
                  className="input mb-3 font-semibold"
                />

                {field.items.map((_, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <GripVertical className="w-4 mt-3 text-muted-foreground" />
                    <input
                      {...form.register(`services.${index}.items.${i}.value`)}
                      className="input flex-1"
                    />
                  </div>
                ))}

                <button type="button" onClick={() => remove(index)}>
                  <Trash2 className="text-red-500" />
                </button>

              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ title: "", items: [{ value: "" }] })}
              className="text-primary flex items-center"
            >
              <PlusCircle className="mr-2" />
              Agregar otro bloque
            </button>

          </div>

          <div className="flex justify-end">
            <button className="bg-primary text-white px-6 py-3 rounded-xl flex items-center">
              <Save className="mr-2" />
              Crear Voucher
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}