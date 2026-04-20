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

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-muted/20 sm:py-8 font-sans print:bg-white print:py-0">

      {/* Controles */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 no-print">
        <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Link>

          <div className="flex gap-3">

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Printer className="w-5 h-5" />
              Imprimir
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-blue-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Descargar PDF
            </button>

          </div>
        </div>
      </div>

      {/* Documento */}
      <div className="max-w-4xl mx-auto bg-white sm:rounded-none sm:shadow-2xl print-container overflow-hidden">
        <div className="p-8 sm:p-12 lg:p-16">

          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-10 border-b-2 border-voucher-blue pb-8">
            <div className="text-center mb-6">
              <img
                src={logoImage}
                alt="Tours Abdiel Travel Logo"
                className="mx-auto h-32 w-auto object-contain mb-4"
              />
              <p className="text-xs font-medium mt-1 text-gray-600 tracking-widest uppercase">
                Agencia de Viajes y Turismo
              </p>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-voucher-blue mt-4 uppercase">
              VOUCHER {voucher.destination}
            </h2>
          </div>

          {/* Datos */}
          <div className="mb-12">
            <table className="w-full text-left border-collapse">
              <tbody>

                <tr className="border-b border-gray-100">
                  <th className="py-2 w-1/3 text-voucher-blue font-bold text-base uppercase tracking-wide">
                    Huésped:
                  </th>
                  <td className="py-2 font-bold text-black text-base">
                    {voucher.guestName}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <th className="py-2 w-1/3 text-voucher-blue font-bold text-base uppercase tracking-wide">
                    Destino:
                  </th>
                  <td className="py-2 font-bold text-black text-base uppercase">
                    {voucher.destination}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <th className="py-2 w-1/3 text-voucher-blue font-bold text-base uppercase tracking-wide">
                    País:
                  </th>
                  <td className="py-2 font-bold text-black text-base uppercase">
                    {voucher.country}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <th className="py-2 w-1/3 text-voucher-blue font-bold text-base uppercase tracking-wide">
                    Cantidad Huésped:
                  </th>
                  <td className="py-2 font-bold text-black text-base">
                    {voucher.guestCount}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <th className="py-2 w-1/3 text-voucher-blue font-bold text-base uppercase tracking-wide">
                    Estadía:
                  </th>
                  <td className="py-2 font-bold text-black text-base">
                    {voucher.stayDates}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Servicios */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-voucher-blue mb-4 underline decoration-2 underline-offset-4">
              Que incluye nuestros Servicios:
            </h3>

            <div className="space-y-4 pl-2">
              {voucher.services.map((service, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-base font-bold text-voucher-blue uppercase">
                    {service.title}
                  </h4>

                  <ul className="list-disc list-inside space-y-1 pl-4">
                    {service.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-black font-medium text-sm leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Aviso */}
          <div className="mt-12 text-center border-t pt-6">
            <div className="text-red-600 font-semibold text-sm mb-2">
              Encargada: Antonia De los Santos | Contacto: (829) 629-6480
            </div>

            <p className="text-red-500 font-bold text-sm uppercase mb-2">
              Gracias por elegir Abdieltours. Les deseamos una estadía llena de momentos felices.
            </p>

            <div className="border border-black p-2 text-xs font-medium">
              UN DOCUMENTO DE IDENTIFICACION
              <span className="bg-cyan-300 font-bold px-1 ml-1">
                (Cedula o Pasaporte)
              </span>
              es imprescindible para que los adultos puedan hacer
              <span className="bg-cyan-300 font-bold px-1 ml-1">
                CHECK IN
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-24 text-center text-sm font-medium text-gray-400 print-only">
            Generado por el Sistema de Vouchers - {new Date().toLocaleDateString()}
          </div>

        </div>
      </div>
    </div>
  );
}