import { useRoute, Link } from "wouter";
import { useVoucher } from "@/hooks/use-vouchers";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import logoImage from "@assets/logo_2024_1772634687195.png";

export default function PrintView() {
  const [, params] = useRoute("/vouchers/:id");
  const voucherId = params?.id ? parseInt(params.id) : null;

  const { data: voucher, isLoading, isError } = useVoucher(voucherId);

  // ✅ SEGURO (NO ROMPE)
  const guestText = voucher
    ? voucher.guestName ||
      (voucher.guestNames
        ? voucher.guestNames.map((g: any) => g.name).join(", ")
        : "N/A")
    : "";

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
        <Link href="/" className="text-primary hover:underline flex items-center">
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

  if (!element) return;

  // @ts-ignore
  const html2pdf = (window as any).html2pdf;

  if (!html2pdf) {
    alert("html2pdf no está cargado");
    return;
  }

  html2pdf().from(element).save();
};

  return (
    <div className="min-h-screen bg-muted/20 sm:py-8 font-sans print:bg-white print:py-0">

      {/* CONTROLES */}
      <div className="max-w-4xl mx-auto px-4 mb-8 no-print">
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <Link href="/" className="flex items-center text-gray-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>

          <div className="flex gap-3">
            <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded">
              <Printer className="w-4 h-4 inline mr-1" />
              Imprimir
            </button>

            <button onClick={handleDownloadPDF} className="bg-blue-700 text-white px-4 py-2 rounded">
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENTO */}
      <div className="max-w-4xl mx-auto bg-white print-container p-10">

        {/* HEADER */}
        <div className="text-center mb-10 border-b pb-6">
          <img src={logoImage} className="mx-auto h-24 mb-3" />
          <p className="text-xs text-gray-500 uppercase">
            Agencia de Viajes y Turismo
          </p>
          <h2 className="text-2xl font-bold text-blue-700 mt-4 uppercase">
            VOUCHER {voucher.destination}
          </h2>
        </div>

        {/* DATOS */}
        <table className="w-full text-left mb-8">
          <tbody>

            <tr className="border-b">
              <th className="py-2 text-blue-700 font-bold">Huésped:</th>
              <td className="py-2 font-bold">{guestText}</td>
            </tr>

            <tr className="border-b">
              <th className="py-2 text-blue-700 font-bold">Estadía:</th>
              <td className="py-2">{voucher.stayDates}</td>
            </tr>

            <tr className="border-b">
              <th className="py-2 text-blue-700 font-bold">Localizador:</th>
              <td className="py-2">{voucher.locator || "N/A"}</td>
            </tr>

            <tr className="border-b">
              <th className="py-2 text-blue-700 font-bold">Teléfono:</th>
              <td className="py-2">{voucher.phone || "N/A"}</td>
            </tr>

            <tr className="border-b">
              <th className="py-2 text-blue-700 font-bold">Plan:</th>
              <td className="py-2">{voucher.plan || "N/A"}</td>
            </tr>

            <tr className="border-b">
              <th className="py-2 text-blue-700 font-bold">Categoría:</th>
              <td className="py-2">{voucher.category || "N/A"}</td>
            </tr>

          </tbody>
        </table>

        {/* SERVICIOS */}
        <div>
          <h3 className="text-lg font-bold text-blue-700 mb-4">
            Que incluye nuestros Servicios:
          </h3>

          {voucher.services?.map((service: any, i: number) => (
            <div key={i} className="mb-3">
              <p className="font-bold text-blue-700">{service.title}</p>
              <ul className="list-disc ml-6">
                {service.items?.map((item: string, j: number) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-center text-sm text-gray-500">
          Generado el {new Date().toLocaleDateString()}
        </div>

      </div>
    </div>
  );
}