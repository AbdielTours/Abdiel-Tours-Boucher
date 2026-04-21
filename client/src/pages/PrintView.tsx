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
      <div className="max-w-4xl mx-auto bg-white print-container p-10 shadow-sm">

        {/* HEADER */}
        <div className="text-center">
          <img src={logoImage} className="mx-auto h-24 mb-2" />

          <p className="text-xs uppercase tracking-widest text-gray-500">
            Agencia de Viajes y Turismo
          </p>

          <h2 className="text-2xl font-bold text-blue-700 mt-3">
            VOUCHER {voucher.destination}
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            DOCUMENTO OFICIAL DE VIAJE
          </p>

          <div className="h-[2px] bg-gradient-to-r from-blue-700 to-blue-400 my-6"></div>
        </div>

        {/* 🔵 DATOS DEL HOTEL */}
<div className="mt-4">

  <h3 className="text-blue-700 font-bold text-sm mb-2 border-b pb-1">
    DATOS DEL HOTEL
  </h3>

  <div className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-2 text-sm">

    <span className="text-blue-700 text-xs font-bold">HOTEL:</span>
    <span className="font-semibold">{voucher.destination}</span>

    <span className="text-blue-700 text-xs font-bold">DESTINO:</span>
    <span>{voucher.country}</span>

    <span className="text-blue-700 text-xs font-bold">TELÉFONO:</span>
    <span>{voucher.phone || "-"}</span>

    <span className="text-blue-700 text-xs font-bold">LOCALIZADOR:</span>
    <span>{voucher.locator || "-"}</span>

      </div>
  </div>

{/* 🔵 DATOS DEL CLIENTE */}
<div className="mt-6">

  <h3 className="text-blue-700 font-bold text-sm mb-2 border-b pb-1">
    DATOS DEL CLIENTE
  </h3>

  <div className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-2 text-sm">

    <span className="text-blue-700 text-xs font-bold">HUÉSPED:</span>
    <span className="font-semibold">{voucher.guestName}</span>

    <span className="text-blue-700 text-xs font-bold">CANTIDAD:</span>
    <span>{voucher.guestCount}</span>

    <span className="text-blue-700 text-xs font-bold">ESTADÍA:</span>
    <span>{voucher.stayDates}</span>

    <span className="text-blue-700 text-xs font-bold">PLAN:</span>
    <span>{voucher.plan || "-"}</span>

    <span className="text-blue-700 text-xs font-bold">CATEGORÍA:</span>
    <span>{voucher.category || "-"}</span>

  </div>
</div>

        {/* SERVICIOS */}
        <div className="mt-8">
          <h3 className="text-blue-700 font-bold border-b pb-1">
            SERVICIOS INCLUIDOS
          </h3>

          {voucher.services.map((s, i) => (
            <div key={i} className="mt-3">
              <p className="font-semibold text-gray-900">{s.title}</p>

              <ul className="list-disc ml-6 mt-1 space-y-1 text-sm">
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

          <p className="text-red-500 font-bold mt-1">
            GRACIAS POR ELEGIR ABDIELTOURS
          </p>
        </div>

      </div>
    </div>
  );
}