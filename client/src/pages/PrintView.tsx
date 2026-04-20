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
        <Link href="/" className="text-primary flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Link>
      </div>
    );
  }

  const handlePrint = () => window.print();

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
    <div className="min-h-screen bg-muted/20 print:bg-white">

      {/* BOTONES */}
      <div className="max-w-4xl mx-auto p-4 flex justify-between no-print">
        <Link href="/" className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Link>

        <div className="flex gap-2">
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded">
            Imprimir
          </button>
          <button onClick={handleDownloadPDF} className="bg-blue-700 text-white px-4 py-2 rounded">
            PDF
          </button>
        </div>
      </div>

      {/* DOCUMENTO */}
      <div className="max-w-4xl mx-auto bg-white print-container p-10">

        {/* HEADER */}
        <div className="text-center border-b pb-6 mb-6">
          <img src={logoImage} className="mx-auto h-24 mb-2" />
          <p className="text-xs uppercase text-gray-500">
            Agencia de Viajes y Turismo
          </p>
          <h2 className="text-2xl font-bold text-blue-700 mt-4">
            CUPÓN {voucher.destination}
          </h2>
        </div>

        {/* DATOS */}
        <table className="w-full mb-8">
          <tbody>

            <tr><td className="font-bold text-blue-700">Huésped:</td><td>{voucher.guestName}</td></tr>
            <tr><td className="font-bold text-blue-700">Destino:</td><td>{voucher.destination}</td></tr>
            <tr><td className="font-bold text-blue-700">País:</td><td>{voucher.country}</td></tr>
            <tr><td className="font-bold text-blue-700">Cantidad:</td><td>{voucher.guestCount}</td></tr>
            <tr><td className="font-bold text-blue-700">Estadía:</td><td>{voucher.stayDates}</td></tr>

            {/* 🔥 ARREGLADO AQUÍ */}

            <tr><td className="font-bold text-blue-700">Localizador:</td><td>{voucher.locator || "N/A"}</td></tr>
            <tr><td className="font-bold text-blue-700">Teléfono:</td><td>{voucher.phone || "N/A"}</td></tr>
            <tr><td className="font-bold text-blue-700">Plan:</td><td>{voucher.plan || "N/A"}</td></tr>
            <tr><td className="font-bold text-blue-700">Categoría:</td><td>{voucher.category || "N/A"}</td></tr>

          </tbody>
        </table>

        {/* SERVICIOS */}
        <div>
          <h3 className="font-bold text-blue-700 mb-2">
            Que incluye nuestros Servicios:
          </h3>

          {voucher.services.map((s, i) => (
            <div key={i}>
              <b>{s.title}</b>
              <ul className="list-disc pl-5">
                {s.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="text-center mt-10 text-sm">
          <p className="text-red-600">
            Encargada: Antonia De los Santos | (829) 629-6480
          </p>
          <p className="text-red-500 font-bold">
            GRACIAS POR ELEGIR ABDIELTOURS
          </p>
        </div>

      </div>
    </div>
  );
}