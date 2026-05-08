import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateVoucher } from "@/hooks/use-vouchers";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";

import {
  ArrowLeft,
  Trash2,
  PlusCircle
} from "lucide-react";

const formSchema = z.object({
  guestNames: z.array(
    z.object({
      name: z.string()
    })
  ),

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
const paquetesTuristicos: Record<string, any[]> = {

  MEDELLIN: [

    {
      title: "1- TRASLADOS",
      items: [
        {
          value: "Traslado aeropuerto hotel ida y vuelta"
        }
      ]
    },

    {
      title: "2- CITY TOUR + COMUNA 13",
      items: [
        {
          value: "Plaza Botero"
        },
        {
          value: "Pueblito Paisa"
        },
        {
          value: "Metro y Metrocable"
        },
        {
          value: "Escaleras eléctricas Comuna 13"
        }
      ]
    },

    {
      title: "3- ENCHIVA RUMBERA",
      items: [
        {
          value: "Recorrido nocturno"
        },
        {
          value: "Parque Lleras"
        },
        {
          value: "Guía acompañante"
        }
      ]
    }

  ],

  CARTAGENA: [

    {
      title: "1- TRASLADOS",
      items: [
        {
          value: "Aeropuerto - Hotel ida y vuelta"
        }
      ]
    },

    {
      title: "2- CITY TOUR",
      items: [
        {
          value: "Centro histórico"
        },
        {
          value: "Castillo San Felipe"
        }
      ]
    }

  ]

};
export default function VoucherFormPage() {

  const queryClient = useQueryClient();

  const { toast } = useToast();

  const createMutation = useCreateVoucher();

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

services:
  type !== "nacional"
    ? [
        {
          title: "1- TRASLADOS",
          items: [{ value: "" }]
        },

        {
          title: "POLÍTICAS Y CONDICIONES",
          items: [

            {
              value:
                "Los traslados aeropuerto hotel, el cliente debe notificar al tour operador al momento de aterrizar en el aeropuerto en destino."
            },

            {
              value:
                "El aviso tardío implica recogida con demora en el aeropuerto."
            },

            {
              value:
                "Los servicios aquí ofrecidos son tours compartidos."
            },

            {
              value:
                "Los niños menores de 3 años pagan solo seguro de viaje y tarifa de avión."
            },

            {
              value:
                "Niños de 4 años en adelante pagan tarifa de adulto."
            },

            {
              value:
                "En caso de no cancelar o modificar el día del tour con 24 horas de anticipación, se tomará el 50% del pago como no show."
            },

            {
              value:
                "Para la realización de los tours se debe llevar ropa y zapato cómodo."
            }

          ]
        }
      ]
    : [
        {
          title: "1- HOTEL",
          items: [{ value: "" }]
        }
      ]
    }
  });

  const {
    fields: guestFields,
    append: addGuest,
    remove: removeGuest
  } = useFieldArray({
    control: form.control,
    name: "guestNames"
  });

  const {
    fields: serviceFields,
    append: appendService
  } = useFieldArray({
    control: form.control,
    name: "services"
  });

  const onSubmit = async (data: FormValues) => {

    try {

      const payload = {

        guestName: data.guestNames
          .map((g) => g.name)
          .join(", "),

        destination: data.destination,
        country: data.country,

        guestCount: data.guestCount,

        stayDates:
          type === "nacional"
            ? formatFechas(
                data.checkIn,
                data.checkOut
              )
            : data.stayDates,

        locator: data.locator || "",
        phone: data.phone || "",
        plan: data.plan || "",
        category: data.category || "",

        services: data.services.map((s) => ({
          title: s.title,
          items: s.items.map((i) => i.value)
        }))
      };

      const created =
        await createMutation.mutateAsync(payload);

      queryClient.invalidateQueries({
        queryKey: ["vouchers"]
      });

      window.location.href = `/vouchers/${created.id}`;

    } catch (error) {

      console.error(error);

      toast({
        title: "Error al guardar",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">

      <Link
        href="/"
        className="flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Link>

      <PageHeader
        title="Nuevo Voucher"
        description={`Tipo: ${type}`}
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >

        {/* INTERNACIONAL */}
        {type !== "nacional" && (
          <>

            {/* VIAJE */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">

              <h3 className="text-blue-700 font-bold mb-6 text-lg">
                INFORMACIÓN DEL VIAJE
              </h3>

              <div className="grid grid-cols-2 gap-4">

               <input
  {...form.register("destination")}
  placeholder="Destino"
  className="p-3 border rounded-xl"
  onChange={(e) => {

    form.setValue(
      "destination",
      e.target.value
    );

    const destino =
      e.target.value.toUpperCase();

    if (
      type !== "nacional" &&
      paquetesTuristicos[destino]
    ) {

      form.setValue(
        "services",
        [

          ...paquetesTuristicos[destino],

          {
            title: "POLÍTICAS Y CONDICIONES",
            items: [

              {
                value:
                  "Los traslados aeropuerto hotel, el cliente debe notificar al tour operador al momento de aterrizar en el aeropuerto en destino."
              },

              {
                value:
                  "El aviso tardío implica recogida con demora en el aeropuerto."
              },

              {
                value:
                  "Los servicios aquí ofrecidos son tours compartidos."
              },

              {
                value:
                  "Los niños menores de 3 años pagan solo seguro de viaje y tarifa de avión."
              },

              {
                value:
                  "Niños de 4 años en adelante pagan tarifa de adulto."
              }

            ]
          }

        ]
      );
    }

  }}
/>

                <input
                  {...form.register("country")}
                  placeholder="País / Ciudad"
                  className="p-3 border rounded-xl"
                />

                <input
                  {...form.register("stayDates")}
                  placeholder="Fechas"
                  className="p-3 border rounded-xl"
                />

                <input
                  type="number"
                  {...form.register("guestCount")}
                  placeholder="Cantidad huéspedes"
                  className="p-3 border rounded-xl"
                />

              </div>
            </div>

            {/* CLIENTES */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">

              <h3 className="text-blue-700 font-bold mb-6 text-lg">
                DATOS DEL CLIENTE
              </h3>

              {guestFields.map((field, i) => (

                <div
                  key={field.id}
                  className="flex gap-2 mb-3"
                >

                  <input
                    {...form.register(
                      `guestNames.${i}.name`
                    )}
                    placeholder={`Nombre huésped ${i + 1}`}
                    className="flex-1 p-3 border rounded-xl"
                  />

                  <button
                    type="button"
                    onClick={() => removeGuest(i)}
                    className="px-3"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>

                </div>

              ))}

              <button
                type="button"
                onClick={() =>
                  addGuest({ name: "" })
                }
                className="text-blue-600 text-sm flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Agregar huésped
              </button>

            </div>

            {/* RESERVA */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">

              <h3 className="text-blue-700 font-bold mb-6 text-lg">
                INFORMACIÓN DE RESERVA
              </h3>

              <div className="grid grid-cols-2 gap-4">

                <input
                  {...form.register("locator")}
                  placeholder="Localizador"
                  className="p-3 border rounded-xl"
                />

                <input
                  {...form.register("phone")}
                  placeholder="Teléfono"
                  className="p-3 border rounded-xl"
                />

                <input
                  {...form.register("plan")}
                  placeholder="Plan"
                  className="p-3 border rounded-xl"
                />

                <input
                  {...form.register("category")}
                  placeholder="Categoría"
                  className="p-3 border rounded-xl"
                />

              </div>

            </div>

            {/* SERVICIOS */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">

              <h3 className="text-blue-700 font-bold mb-6 text-lg">
                SERVICIOS INCLUIDOS
              </h3>

              {serviceFields.map((field, index) => (

                <div
                  key={field.id}
                  className="mb-6 border rounded-xl p-4"
                >

<input
  {...form.register(
    `services.${index}.title`
  )}
  placeholder="Título del servicio"
  className={`w-full p-3 border rounded-xl mb-4 font-bold ${
    field.title === "POLÍTICAS Y CONDICIONES"
      ? "text-red-600"
      : "text-blue-700"
  }`}
                  />

                  <ServiceItems
                    control={form.control}
                    register={form.register}
                    serviceIndex={index}
                  />

                </div>

              ))}

              <button
                type="button"
                onClick={() =>
                  appendService({
                    title: "",
                    items: [{ value: "" }]
                  })
                }
                className="text-blue-600 text-sm flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Agregar servicio
              </button>

            </div>

          </>
        )}

        {/* NACIONAL */}
        {type === "nacional" && (

          <div className="bg-white border rounded-2xl p-6 shadow-sm">

            <h3 className="text-blue-700 font-bold mb-6 text-lg">
              RESERVA NACIONAL
            </h3>

            {/* HOTEL */}
            <div className="mb-8">

              <h4 className="font-semibold text-gray-700 mb-4">
                INFORMACIÓN DEL HOTEL
              </h4>

              <div className="grid grid-cols-2 gap-4">

                <input
                  {...form.register("destination")}
                  placeholder="Hotel"
                  className="p-3 border rounded-xl"
                />

                <input
                  {...form.register("country")}
                  placeholder="Destino"
                  className="p-3 border rounded-xl"
                />

                <input
                  type="date"
                  {...form.register("checkIn")}
                  className="p-3 border rounded-xl"
                />

                <input
                  type="date"
                  {...form.register("checkOut")}
                  className="p-3 border rounded-xl"
                />

                <input
                  {...form.register("locator")}
                  placeholder="Localizador"
                  className="p-3 border rounded-xl"
                />

                <input
                  {...form.register("phone")}
                  placeholder="Teléfono"
                  className="p-3 border rounded-xl"
                />

                <input
                  {...form.register("plan")}
                  placeholder="Plan"
                  className="p-3 border rounded-xl"
                />

                <input
                  {...form.register("category")}
                  placeholder="Categoría"
                  className="p-3 border rounded-xl"
                />

              </div>
            </div>

            {/* CLIENTES */}
            <div className="mb-8">

              <h4 className="font-semibold text-gray-700 mb-4">
                DATOS DEL CLIENTE
              </h4>

              {guestFields.map((field, i) => (

                <div
                  key={field.id}
                  className="flex gap-2 mb-3"
                >

                  <input
                    {...form.register(
                      `guestNames.${i}.name`
                    )}
                    placeholder={`Nombre huésped ${i + 1}`}
                    className="flex-1 p-3 border rounded-xl"
                  />

                  <button
                    type="button"
                    onClick={() => removeGuest(i)}
                    className="px-3"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>

                </div>

              ))}

              <button
                type="button"
                onClick={() =>
                  addGuest({ name: "" })
                }
                className="text-blue-600 text-sm flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Agregar huésped
              </button>

            </div>

            {/* SERVICIOS */}
            <div>

              <h4 className="font-semibold text-gray-700 mb-4">
                SERVICIOS INCLUIDOS
              </h4>

              {serviceFields.map((field, index) => (

                <div
                  key={field.id}
                  className="mb-6 border rounded-xl p-4"
                >

                  <input
                    {...form.register(
                      `services.${index}.title`
                    )}
                    placeholder="Título del servicio"
                    className="w-full p-3 border rounded-xl mb-4"
                  />

                  <ServiceItems
                    control={form.control}
                    register={form.register}
                    serviceIndex={index}
                  />

                </div>

              ))}

              <button
                type="button"
                onClick={() =>
                  appendService({
                    title: "",
                    items: [{ value: "" }]
                  })
                }
                className="text-blue-600 text-sm flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Agregar servicio
              </button>

            </div>

          </div>

        )}

        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-sm hover:bg-blue-700 transition-all"
        >
          Crear Voucher
        </button>

      </form>

    </div>
  );
}

function formatFechas(
  checkIn?: string,
  checkOut?: string
) {

  if (!checkIn || !checkOut) return "";

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ];

  const entrada = new Date(checkIn);
  const salida = new Date(checkOut);

  return `Del ${entrada.getDate()} al ${salida.getDate()} de ${meses[entrada.getMonth()]} ${entrada.getFullYear()}`;
}

function ServiceItems({
  control,
  register,
  serviceIndex
}: any) {

  const {
    fields,
    append,
    remove
  } = useFieldArray({
    control,
    name: `services.${serviceIndex}.items`
  });

  return (

    <div>

      {fields.map((item, i) => (

        <div
          key={item.id}
          className="flex gap-2 mb-2"
        >

          <input
            {...register(
              `services.${serviceIndex}.items.${i}.value`
            )}
            className="flex-1 p-2 border rounded-xl"
          />

          <button
            type="button"
            onClick={() => remove(i)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>

        </div>

      ))}

      <button
        type="button"
        onClick={() =>
          append({ value: "" })
        }
        className="text-blue-600 text-sm flex items-center gap-2 mt-2"
      >
        <PlusCircle className="w-4 h-4" />
        Agregar item
      </button>

    </div>

  );
}