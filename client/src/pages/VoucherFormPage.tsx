<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

  {/* Información del huésped */}
  <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/60">
    <h2 className="text-xl font-semibold mb-6">Información del Huésped</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div className="md:col-span-2">
        <label className="text-sm font-medium">Nombre</label>
        <input {...form.register("guestName")} className="w-full px-4 py-3 border rounded-xl" />
      </div>

      <div>
        <label className="text-sm font-medium">Destino</label>
        <input {...form.register("destination")} className="w-full px-4 py-3 border rounded-xl" />
      </div>

      <div>
        <label className="text-sm font-medium">País</label>
        <input {...form.register("country")} className="w-full px-4 py-3 border rounded-xl" />
      </div>

      <div>
        <label className="text-sm font-medium">Cantidad</label>
        <input type="number" {...form.register("guestCount")} className="w-full px-4 py-3 border rounded-xl" />
      </div>

      <div>
        <label className="text-sm font-medium">Fechas</label>
        <input {...form.register("stayDates")} className="w-full px-4 py-3 border rounded-xl" />
      </div>

    </div>
  </div>

  {/* Servicios */}
  <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/60">
    <h2 className="text-xl font-semibold mb-6">Servicios</h2>

    {serviceFields.map((field, index) => (
      <div key={field.id} className="mb-4">

        <input
          {...form.register(`services.${index}.title`)}
          className="w-full px-4 py-2 border rounded-lg mb-2"
        />

        {field.items?.map((_, i) => (
          <input
            key={i}
            {...form.register(`services.${index}.items.${i}.value`)}
            className="w-full px-4 py-2 border rounded-lg mb-2"
          />
        ))}

      </div>
    ))}

    <button
      type="button"
      onClick={() => appendService({ title: "", items: [{ value: "" }] })}
      className="text-blue-600"
    >
      + Agregar servicio
    </button>
  </div>

  {/* Botón */}
  <div className="flex justify-end">
    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl">
      Guardar
    </button>
  </div>

</form>
