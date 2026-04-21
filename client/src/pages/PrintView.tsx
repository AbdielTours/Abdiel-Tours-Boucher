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

        {/* INFO PRINCIPAL */}
        <div className="grid grid-cols-2 gap-y-4 text-sm mt-6">

          <span className="text-blue-700 text-xs tracking-wide font-bold">HUÉSPED:</span>
          <span className="font-semibold text-gray-800">{voucher.guestName}</span>

          <span className="text-blue-700 text-xs tracking-wide font-bold">DESTINO:</span>
          <span className="font-semibold text-gray-800">{voucher.destination}</span>

          <span className="text-blue-700 text-xs tracking-wide font-bold">PAÍS:</span>
          <span className="font-semibold text-gray-800">{voucher.country}</span>

          <span className="text-blue-700 text-xs tracking-wide font-bold">CANTIDAD:</span>
          <span className="font-semibold text-gray-800">{voucher.guestCount}</span>

          <span className="text-blue-700 text-xs tracking-wide font-bold">ESTADÍA:</span>
          <span className="font-semibold text-gray-800">{voucher.stayDates}</span>

          <span className="text-blue-700 text-xs tracking-wide font-bold">LOCALIZADOR:</span>
          <span>{voucher.locator || "-"}</span>

          <span className="text-blue-700 text-xs tracking-wide font-bold">TELÉFONO:</span>
          <span>{voucher.phone || "-"}</span>

          <span className="text-blue-700 text-xs tracking-wide font-bold">PLAN:</span>
          <span>{voucher.plan || "-"}</span>

          <span className="text-blue-700 text-xs tracking-wide font-bold">CATEGORÍA:</span>
          <span>{voucher.category || "-"}</span>

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
<div className="text-center mt-12 text-sm border-t pt-4">

  <p className="text-gray-600">
    Encargada: Antonia De los Santos | (829) 629-6480
  </p>

  <p className="text-red-600 font-semibold mt-2">
    GRACIAS POR ELEGIR ABDIELTOURS
  </p>

  <p className="text-xs text-gray-400 mt-2">
    Documento válido para fines de confirmación de servicios turísticos
  </p>

</div>

      </div>
    </div>
  );
}