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
  Loader2,
  PlusCircle
} from "lucide-react";

const formSchema = z.object({
  guestNames: z.array(z.object({ name: z.string() })),
  destination: z.string(),
  country: z.string(),
  guestCount: z.coerce.number(),
  stayDates: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  locator: z.string().optional(),
  phone: z.string().optional(),
  plan: z.string().optional(),
  category: z.string().optional(),
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
      guestNames: [{ name: "" }],
      destination: "",
      country: "",
      guestCount: 1,
      stayDates: "",
      checkIn: "",
      checkOut: "",
      locator: "",
      phone: "",
      plan: "",
      category: "",
      services: [{ title: "1- TRASLADOS", items: [{ value: "" }] }]
    }
  });

  const { fields: guestFields, append: addGuest, remove: removeGuest } = useFieldArray({
    control: form.control,
    name: "guestNames"
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services"
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const stayDatesFormatted =
        type === "nacional"
          ? formatFechas(data.checkIn, data.checkOut)
          : data.stayDates;

      const payload = {
        ...data,
        guestName: data.guestNames.map(g => g.name).join(", "),
        stayDates: stayDatesFormatted,
        services: data.services.map(s => ({
          title: s.title,
          items: s.items.map(i => i.value)
        }))
      };

      const created = await createMutation.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      window.location.href = `/vouchers/${created.id}`;
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      <Link href="/" className="flex items-center mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Link>

      <PageHeader title="Nuevo Voucher" description={`Tipo: ${type}`} />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* NOMBRES */}
        <div>
          <h3 className="font-semibold mb-2">Huéspedes</h3>

          {guestFields.map((field, i) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...form.register(`guestNames.${i}.name`)}
                placeholder={`Nombre ${i + 1}`}
                className="flex-1 p-2 border rounded"
              />
              <button type="button" onClick={() => removeGuest(i)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addGuest({ name: "" })}>
            <PlusCircle className="w-4 h-4 inline mr-1" />
            Agregar nombre
          </button>
        </div>

        {/* INFO EXTRA */}
        <div className="grid grid-cols-2 gap-4">
          <input {...form.register("locator")} placeholder="Localizador" className="p-2 border rounded"/>
          <input {...form.register("phone")} placeholder="Teléfono" className="p-2 border rounded"/>
          <input {...form.register("plan")} placeholder="Plan" className="p-2 border rounded"/>
          <input {...form.register("category")} placeholder="Categoría" className="p-2 border rounded"/>
        </div>

        {/* DESTINO */}
        <div className="grid grid-cols-2 gap-4">
          <input {...form.register("destination")} placeholder="Destino / Hotel" className="p-2 border rounded"/>
          <input {...form.register("country")} placeholder="País / Ciudad" className="p-2 border rounded"/>
          <input type="number" {...form.register("guestCount")} className="p-2 border rounded"/>

          {type === "nacional" ? (
            <>
              <input type="date" {...form.register("checkIn")} className="p-2 border rounded"/>
              <input type="date" {...form.register("checkOut")} className="p-2 border rounded"/>
            </>
          ) : (
            <input {...form.register("stayDates")} placeholder="Fechas" className="p-2 border rounded"/>
          )}
        </div>

        {/* SERVICIOS */}
        <div>
          <h3 className="font-semibold mb-2">Servicios</h3>

          {serviceFields.map((field, index) => (
            <div key={field.id} className="mb-3">
              <input {...form.register(`services.${index}.title`)} className="w-full p-2 border mb-2"/>

              <ServiceItems control={form.control} register={form.register} serviceIndex={index}/>
            </div>
          ))}

          <button type="button" onClick={() => appendService({ title: "", items: [{ value: "" }] })}>
            + Servicio
          </button>
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          Crear Voucher
        </button>

      </form>
    </div>
  );
}

function formatFechas(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return "";

  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const entrada = new Date(checkIn);
  const salida = new Date(checkOut);

  return `Del ${entrada.getDate()} al ${salida.getDate()} de ${meses[entrada.getMonth()]} ${entrada.getFullYear()}`;
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
          <input {...register(`services.${serviceIndex}.items.${i}.value`)} className="flex-1 p-2 border"/>
          <button type="button" onClick={() => remove(i)}>
            <Trash2 className="w-4 h-4 text-red-500"/>
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ value: "" })}>
        + Item
      </button>
    </div>
  );
}