import { useRoute, Link } from "wouter";
import { useVoucher } from "@/hooks/use-vouchers";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import logoImage from "@assets/logo_2024_1772634687195.png";

export default function PrintView() {
  const [, params] = useRoute("/vouchers/:id");
  const voucherId = params?.id ? parseInt(params.id) : null;

  const { data: voucher, isLoading, isError } = useVoucher(voucherId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !voucher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <p className="text-xl font-medium text-muted-foreground mb-4">
          Voucher no encontrado
        </p>
        <Link
          href="/"
          className="text-primary hover:underline flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inicio
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.querySelector(".print-container");

    const opt = {
      margin: 0.3,
      filename: `voucher-${voucher.guestName}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-muted/20 sm:py-8 font-sans print:bg-white print:py-0">

      {/* CONTROLES */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 no-print">
        <div className="bg-card p-4 rounded-2xl shadow-sm border flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Link>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>

            <button
              onClick={handleDownloadPDF}
              className="bg-blue-700 text-white px-5 py-2 rounded-xl"
            >
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENTO */}
      <div className="max-w-4xl mx-auto bg-white print-container">
        <div className="p-10">

          {/* LOGO */}
          <div className="text-center mb-8 border-b pb-6">
            <img src={logoImage} className="mx-auto h-28 mb-2" />
            <p className="text-xs uppercase text-gray-500 tracking-widest">
              Agencia de Viajes y Turismo
            </p>

            <h2 className="text-2xl font-bold text-voucher-blue mt-4 uppercase">
              CUPÓN {voucher.destination}
            </h2>
          </div>

          {/* DATOS */}
          <table className="w-full border-collapse mb-10">
            <tbody>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase w-1/3">
                  Huésped:
                </th>
                <td className="py-2 font-bold">
                  {voucher.guestName}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Destino:
                </th>
                <td className="py-2 font-bold uppercase">
                  {voucher.destination}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  País:
                </th>
                <td className="py-2 font-bold uppercase">
                  {voucher.country}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Cantidad:
                </th>
                <td className="py-2 font-bold">
                  {voucher.guestCount}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Estadía:
                </th>
                <td className="py-2 font-bold">
                  {voucher.stayDates}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Localizador:
                </th>
                <td className="py-2 font-bold">
                  {voucher.stayDates}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Teléfono:
                </th>
                <td className="py-2 font-bold">
                  {voucher.stayDates}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Plan:
                </th>
                <td className="py-2 font-bold">
                  {voucher.stayDates}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Categoría:
                </th>
                <td className="py-2 font-bold">
                  {voucher.stayDates}
                </td>
              </tr>

              {/* 🔥 CAMPOS NUEVOS */}

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Localizador:
                </th>
                <td className="py-2 font-bold">
                  {voucher.locator || "N/A"}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Teléfono:
                </th>
                <td className="py-2 font-bold">
                  {voucher.phone || "N/A"}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Plan:
                </th>
                <td className="py-2 font-bold">
                  {voucher.plan || "N/A"}
                </td>
              </tr>

              <tr className="border-b">
                <th className="py-2 text-voucher-blue font-bold uppercase">
                  Categoría:
                </th>
                <td className="py-2 font-bold">
                  {voucher.category || "N/A"}
                </td>
              </tr>

            </tbody>
          </table>

          {/* SERVICIOS */}
          <div>
            <h3 className="text-lg font-bold text-voucher-blue mb-3 underline">
              Que incluye nuestros Servicios:
            </h3>

            {voucher.services.map((service, i) => (
              <div key={i} className="mb-4">
                <h4 className="font-bold text-voucher-blue uppercase">
                  {service.title}
                </h4>

                <ul className="list-disc pl-6">
                  {service.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="mt-10 text-center text-sm">
            <p className="text-red-600 font-semibold">
              Encargada: Antonia De los Santos | Contacto: (829) 629-6480
            </p>

            <p className="text-red-500 font-bold mt-2">
              GRACIAS POR ELEGIR ABDIELTOURS
            </p>

            <div className="border mt-3 p-2 text-xs">
              Documento requerido: <b>Cédula o Pasaporte</b>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}