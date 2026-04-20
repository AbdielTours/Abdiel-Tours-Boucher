import { useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVoucher, useCreateVoucher, useUpdateVoucher } from "@/hooks/use-vouchers";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, PlusCircle, Trash2, Loader2, GripVertical } from "lucide-react";

const type = new URLSearchParams(window.location.search).get("type");

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
      services: [
        {
          title: type === "nacional" ? "1- HOTEL" : "1- TRASLADOS",
          items: [{ value: "" }]
        }
      ]
    }
  });

  const servicesArray = useFieldArray({
    control: form.control,
    name: "services"
  });

  const itemsArray = (index: number) =>
    useFieldArray({
      control: form.control,
      name: `services.${index}.items`
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
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">

        <Link href="/" className="flex items-center mb-6">
          <ArrowLeft className="mr-2" /> Volver
        </Link>

        <PageHeader
          title="Crear Nuevo Voucher"
          description={`Tipo: ${type === "nacional" ? "Nacional 🇩🇴" : "Internacional ✈️"}`}
        />

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* INFO */}
          <div className="bg-card rounded-2xl p-6 shadow border">
            <h2 className="text-xl font-semibold mb-6">Información del Huésped</h2>

            <input {...form.register("guestName")} className="input mb-4" placeholder="Nombre" />

            <div className="grid md:grid-cols-2 gap-4">
              <input {...form.register("destination")} className="input" placeholder="Destino" />
              <input {...form.register("country")} className="input" placeholder="País" />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <input type="number" {...form.register("guestCount")} className="input" />
              <input {...form.register("stayDates")} className="input" placeholder="Fechas" />
            </div>
          </div>

          {/* SERVICIOS */}
          <div className="bg-card rounded-2xl p-6 shadow border">
            <h2 className="text-xl font-semibold mb-6">Servicios Incluidos</h2>

            {servicesArray.fields.map((field, index) => {
              const items = itemsArray(index);

              return (
                <div key={field.id} className="border p-4 rounded-xl mb-4">

                  <input
                    {...form.register(`services.${index}.title`)}
                    className="input mb-3 font-semibold"
                  />

                  {items.fields.map((item, i) => (
                    <div key={item.id} className="flex gap-2 mb-2">
                      <GripVertical className="w-4 mt-3" />
                      <input
                        {...form.register(`services.${index}.items.${i}.value`)}
                        className="input flex-1"
                      />
                      <button type="button" onClick={() => items.remove(i)}>
                        <Trash2 className="text-red-500" />
                      </button>
                    </div>
                  ))}

                  <button type="button" onClick={() => items.append({ value: "" })}>
                    + Agregar item
                  </button>

                </div>
              );
            })}

            <button
              type="button"
              onClick={() =>
                servicesArray.append({
                  title: "",
                  items: [{ value: "" }]
                })
              }
            >
              <PlusCircle /> Agregar otro bloque
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