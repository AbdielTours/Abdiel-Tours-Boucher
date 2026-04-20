import { Link, useLocation } from "wouter";
import { useVouchers, useDeleteVoucher } from "@/hooks/use-vouchers";
import { PageHeader } from "@/components/PageHeader";
import { 
  FileText, 
  Plus, 
  MapPin, 
  Users, 
  CalendarDays, 
  Trash2, 
  Edit, 
  Printer,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: vouchers, isLoading, isError } = useVouchers();
  const deleteMutation = useDeleteVoucher();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este voucher? Esta acción no se puede deshacer.")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({
          title: "Voucher eliminado",
          description: "El voucher se ha eliminado correctamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el voucher.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <PageHeader 
          title="Gestión de Vouchers" 
          description="Administra y genera comprobantes de viaje para tus clientes."
          action={
            <Link 
              href="/vouchers/new" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Voucher</span>
            </Link>
          }
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
            <p>Cargando vouchers...</p>
          </div>
        ) : isError ? (
          <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 text-center">
            <p className="font-semibold">Ha ocurrido un error al cargar los datos.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : !vouchers?.length ? (
          <div className="bg-card border border-border/50 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No hay vouchers aún</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Crea tu primer voucher para comenzar a gestionar las reservas de tus clientes.
            </p>
            <Link 
              href="/vouchers/new" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Crear mi primer voucher</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vouchers.map((voucher) => (
              <div 
                key={voucher.id} 
                className="bg-card rounded-2xl p-6 shadow-sm border border-border/60 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-semibold tracking-wide">
                    Voucher #{voucher.id}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setLocation(`/vouchers/${voucher.id}/edit`)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(voucher.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-4 line-clamp-1">
                  {voucher.guestName}
                </h3>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-3 text-primary/60" />
                    <span className="truncate">{voucher.destination}, {voucher.country}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-3 text-primary/60" />
                    <span>{voucher.guestCount} Huésped{voucher.guestCount !== 1 ? 'es' : ''}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4 mr-3 text-primary/60" />
                    <span className="truncate">{voucher.stayDates}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <button 
                    onClick={() => setLocation(`/vouchers/${voucher.id}`)}
                    className="w-full py-2.5 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Ver e Imprimir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
