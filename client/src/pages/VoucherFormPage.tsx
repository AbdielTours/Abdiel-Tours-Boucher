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

// Local form schema to handle nested arrays easily with react-hook-form
const formSchema = z.object({
  guestName: z.string().min(2, "El nombre es requerido"),
  destination: z.string().min(2, "El destino es requerido"),
  country: z.string().min(2, "El país es requerido"),
  guestCount: z.coerce.number().min(1, "Debe ser al menos 1 huésped"),
  stayDates: z.string().min(2, "Las fechas son requeridas"),
  services: z.array(z.object({
    title: z.string().min(1, "El título del servicio es requerido"),
    items: z.array(z.object({
      value: z.string().min(1, "El item no puede estar vacío")
    })).min(1, "Agrega al menos un detalle al servicio")
  })).min(1, "Agrega al menos un bloque de servicios")
});

type FormValues = z.infer<typeof formSchema>;

export default function VoucherFormPage() {
  const [, params] = useRoute("/vouchers/:id/edit");
  const isEdit = !!params?.id;
  const voucherId = isEdit ? parseInt(params.id) : null;
  
  const [, setLocation] = useLocation();
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
      services: [{ title: "1- TRASLADOS", items: [{ value: "" }] }]
    }
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services"
  });

  // Load data for edit mode
  useEffect(() => {
    if (voucher && isEdit) {
      form.reset({
        guestName: voucher.guestName,
        destination: voucher.destination,
        country: voucher.country,
        guestCount: voucher.guestCount,
        stayDates: voucher.stayDates,
        // Map string[] to {value: string}[] for react-hook-form
        services: voucher.services.map((s: any) => ({
          title: s.title,
          items: s.items.map((item: string) => ({ value: item }))
        }))
      });
    }
  }, [voucher, isEdit, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Transform back to API schema
      const payload = {
        guestName: data.guestName,
        destination: data.destination,
        country: data.country,
        guestCount: data.guestCount,
        stayDates: data.stayDates,
        services: data.services.map(s => ({
          title: s.title,
          items: s.items.map(i => i.value)
        }))
      };

      if (isEdit && voucherId) {
        await updateMutation.mutateAsync({ id: voucherId, ...payload });
        toast({ title: "Voucher actualizado con éxito" });
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast({ title: "Voucher creado con éxito" });
        setLocation(`/vouchers/${created.id}`); // Redirect to view after create
        return;
      }
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "Error desconocido",
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
          description="Completa los datos del huésped y los servicios incluidos."
        />

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Guest Info Section */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/60">
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
              Información del Huésped
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Nombre del Huésped</label>
                <input 
                  {...form.register("guestName")}
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Ej. Juan Pérez"
                />
                {form.formState.errors.guestName && (
                  <p className="text-sm text-destructive">{form.formState.errors.guestName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Destino</label>
                <input 
                  {...form.register("destination")}
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Ej. MEDELLÍN"
                />
                {form.formState.errors.destination && (
                  <p className="text-sm text-destructive">{form.formState.errors.destination.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">País</label>
                <input 
                  {...form.register("country")}
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Ej. COLOMBIA"
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cantidad de Huéspedes</label>
                <input 
                  type="number"
                  {...form.register("guestCount")}
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  min="1"
                />
                {form.formState.errors.guestCount && (
                  <p className="text-sm text-destructive">{form.formState.errors.guestCount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Fechas de Estadía</label>
                <input 
                  {...form.register("stayDates")}
                  className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Ej. Del 22 al 26 de Noviembre de 2024"
                />
                {form.formState.errors.stayDates && (
                  <p className="text-sm text-destructive">{form.formState.errors.stayDates.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/60">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                Servicios Incluidos
              </h2>
            </div>
            
            <div className="space-y-8">
              {serviceFields.map((field, index) => (
                <div key={field.id} className="p-5 rounded-xl border border-border/80 bg-muted/20 relative">
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Eliminar servicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-4 pr-10">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Título del Servicio</label>
                      <input 
                        {...form.register(`services.${index}.title` as const)}
                        className="w-full px-4 py-2.5 rounded-lg bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-semibold"
                        placeholder="Ej. 1- TRASLADOS"
                      />
                      {form.formState.errors.services?.[index]?.title && (
                        <p className="text-sm text-destructive">{form.formState.errors.services[index]?.title?.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground block">Elementos del servicio</label>
                      <ServiceItems control={form.control} register={form.register} serviceIndex={index} errors={form.formState.errors} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => appendService({ title: "", items: [{ value: "" }] })}
              className="mt-6 flex items-center justify-center w-full py-4 border-2 border-dashed border-primary/30 rounded-xl text-primary font-medium hover:bg-primary/5 hover:border-primary/50 transition-all"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Agregar otro bloque de servicios
            </button>
            {form.formState.errors.services?.root && (
              <p className="text-sm text-destructive mt-2 text-center">{form.formState.errors.services.root.message}</p>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href="/" className="px-6 py-3 rounded-xl font-medium text-foreground hover:bg-muted transition-colors">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center px-8 py-3 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all duration-200"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isEdit ? "Guardar Cambios" : "Crear Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-component to handle nested items array cleanly
function ServiceItems({ control, register, serviceIndex, errors }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.items`
  });

  return (
    <div className="space-y-3">
      {fields.map((item, itemIndex) => (
        <div key={item.id} className="flex gap-2 items-start">
          <div className="mt-3 text-muted-foreground">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <input 
              {...register(`services.${serviceIndex}.items.${itemIndex}.value` as const)}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
              placeholder="Ej. Traslado Aeropuerto - Hotel - Aeropuerto"
            />
            {errors?.services?.[serviceIndex]?.items?.[itemIndex]?.value && (
              <p className="text-xs text-destructive mt-1">
                {errors.services[serviceIndex].items[itemIndex].value.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(itemIndex)}
            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            disabled={fields.length === 1}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ value: "" })}
        className="text-sm text-primary font-medium flex items-center hover:underline ml-6"
      >
        <PlusCircle className="w-4 h-4 mr-1" />
        Agregar item
      </button>
    </div>
  );
}
