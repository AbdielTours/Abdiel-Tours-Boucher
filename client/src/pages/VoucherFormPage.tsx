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
  Trash2,
  Loader2
} from "lucide-react";

const formSchema = z.object({
  guestName: z.string().min(2),
  destination: z.string().min(2),
  country: z.string().min(2),
  guestCount: z.coerce.number().min(1),
  stayDates: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
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
      checkIn: "",
      checkOut: "",
      services: [{ title: "1- TRASLADOS", items: [{ value: "" }] }]
    }
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services"
  });

  useEffect(() => {
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
        checkIn: "",
        checkOut: "",
        services: voucher.services.map((s: any) => ({
          title: s.title,
          items: s.items.map((item: string) => ({ value: item }))
        }))
      });
    }
  }, [voucher]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        stayDates:
          type === "nacional"
            ? `Del ${data.checkIn} al ${data.checkOut}`
            : data.stayDates,
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
      <div className="max-w-4xl mx-auto px-4 pt-8">

        <Link href="/" className="inline-flex items-center mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Link>

        <PageHeader
          title={isEdit ? "Editar Voucher" : "Crear Nuevo Voucher"}
          description={`Tipo: ${type === "nacional" ? "Nacional 🇩🇴" : "Internacional ✈️"}`}
        />

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <div className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold mb-6">Información del Huésped</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <input {...form.register("guestName")} placeholder="Nombre del huésped" className="p-3 border rounded-xl w-full"/>
              </div>

              {type === "nacional" ? (
                <>
                  <input {...form.register("destination")} placeholder="Hotel" className="p-3 border rounded-xl"/>
                  <input {...form.register("country")} placeholder="Ciudad" className="p-3 border rounded-xl"/>
                  <input type="number" {...form.register("guestCount")} placeholder="Cantidad" className="p-3 border rounded-xl"/>

                  <input type="date" {...form.register("checkIn")} className="p-3 border rounded-xl"/>
                  <input type="date" {...form.register("checkOut")} className="p-3 border rounded-xl"/>
                </>
              ) : (
                <>
                  <input {...form.register("destination")} placeholder="Destino" className="p-3 border rounded-xl"/>
                  <input {...form.register("country")} placeholder="País" className="p-3 border rounded-xl"/>
                  <input type="number" {...form.register("guestCount")} placeholder="Cantidad" className="p-3 border rounded-xl"/>
                  <input {...form.register("stayDates")} placeholder="Fechas" className="p-3 border rounded-xl"/>
                </>
              )}

            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-semibold mb-6">Servicios Incluidos</h2>

            {serviceFields.map((field, index) => (
              <div key={field.id} className="mb-4 p-4 border rounded-xl">
                <input {...form.register(`services.${index}.title`)} className="w-full p-2 border rounded mb-2"/>

                <ServiceItems control={form.control} register={form.register} serviceIndex={index} />

                <button type="button" onClick={() => removeService(index)} className="text-red-500 mt-2">
                  Eliminar
                </button>
              </div>
            ))}

            <button type="button" onClick={() => appendService({ title: "", items: [{ value: "" }] })} className="text-blue-600">
              + Agregar servicio
            </button>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl">
              {isPending ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Voucher"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function ServiceItems({ control, register, serviceIndex }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.items`
  });

  return (
    <div>
      {fields.map((item, i) => (
        <div key={item.id} className="flex gap-2 mb-2">
          <input {...register(`services.${serviceIndex}.items.${i}.value`)} className="flex-1 p-2 border rounded"/>
          <button type="button" onClick={() => remove(i)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ value: "" })} className="text-blue-600 text-sm">
        + Agregar item
      </button>
    </div>
  );
}