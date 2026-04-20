import { useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVoucher, useCreateVoucher, useUpdateVoucher } from "@/hooks/use-vouchers";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, PlusCircle, Trash2, Loader2 } from "lucide-react";

// 👇 detectar tipo
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
      items: z.array(
        z.object({
          value: z.string()
        })
      )
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
                items: [{ value: "Alojamiento" }]
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
    } catch (e) {
      toast({ title: "Error guardando" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/" className="flex items-center mb-4">
        <ArrowLeft className="mr-2" /> Volver
      </Link>

      <PageHeader
        title="Crear Nuevo Voucher"
        description={`Tipo: ${type === "nacional" ? "Nacional 🇩🇴" : "Internacional ✈️"}`}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* INFO */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="mb-4 font-semibold">Información del Huésped</h2>

          <input {...form.register("guestName")} placeholder="Nombre" className="w-full mb-3 p-2 border rounded" />

          <div className="grid grid-cols-2 gap-3">
            <input {...form.register("destination")} placeholder="Destino" className="p-2 border rounded" />
            <input {...form.register("country")} placeholder="País" className="p-2 border rounded" />
            <input type="number" {...form.register("guestCount")} className="p-2 border rounded" />
            <input {...form.register("stayDates")} placeholder="Fechas" className="p-2 border rounded" />
          </div>
        </div>

        {/* SERVICIOS */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="mb-4 font-semibold">Servicios</h2>

          {fields.map((field, index) => (
            <div key={field.id} className="mb-4 border p-3 rounded">

              <input
                {...form.register(`services.${index}.title`)}
                className="w-full mb-2 p-2 border rounded"
              />

              {field.items?.map((_, i) => (
                <input
                  key={i}
                  {...form.register(`services.${index}.items.${i}.value`)}
                  className="w-full mb-2 p-2 border rounded"
                />
              ))}

              <button type="button" onClick={() => remove(index)}>
                <Trash2 />
              </button>
            </div>
          ))}

          <button type="button" onClick={() => append({ title: "", items: [{ value: "" }] })}>
            <PlusCircle /> Agregar servicio
          </button>
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded flex items-center">
          <Save className="mr-2" /> Guardar
        </button>

      </form>
    </div>
  );
}