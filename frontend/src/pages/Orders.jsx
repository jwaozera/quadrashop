import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { getOrders } from '../api/orders';
import { formatCurrency, formatDate } from '../utils/format';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

const statusConfig = {
  pending: { label: 'Aguardando', color: 'warning' },
  processing: { label: 'Processando', color: 'brand' },
  shipped: { label: 'Enviado', color: 'brand' },
  delivered: { label: 'Entregue', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'error' },
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        // Sort by date (most recent first)
        const sortedOrders = (data || []).sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setOrders(sortedOrders);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    // Optional: Polling every 30s for status updates
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--text-primary)] mb-6">
            Meus pedidos
          </h1>
          <div className="space-y-4" aria-busy="true">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Skeleton height="16px" width="100px" className="mb-2" />
                    <Skeleton height="14px" width="80px" />
                  </div>
                  <Skeleton height="24px" width="80px" rounded="full" />
                </div>
                <Skeleton height="14px" width="200px" className="mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton height="18px" width="80px" />
                  <Skeleton height="14px" width="100px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="min-h-screen pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-[var(--text-tertiary)]" />
          </div>
          <h1 className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--text-primary)] mb-2">
            Nenhum pedido ainda
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mb-8">
            Quando você fizer uma compra, seus pedidos aparecerão aqui
          </p>
          <Button onClick={() => navigate('/')} icon={ShoppingBag}>
            Fazer primeiro pedido
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--text-primary)] mb-6">
          Meus pedidos
        </h1>

        <div className="space-y-4">
          {orders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const itemNames = (order.items || []).map(item => item.name).join(', ');

            return (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className="block bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 transition-all hover:shadow-[var(--shadow-sm)] hover:border-[var(--border-default)] animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[14px] font-medium text-[var(--text-primary)]">
                      Pedido #{order.id}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)]">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <Badge color={status.color} size="sm">
                    {status.label}
                  </Badge>
                </div>

                <p className="text-[13px] text-[var(--text-secondary)] truncate mb-3">
                  {itemNames || 'Itens do pedido'}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-[16px] font-semibold text-[var(--text-primary)]">
                    {formatCurrency(order.total || 0)}
                  </span>
                  <span className="flex items-center gap-1 text-[13px] text-[var(--brand)] font-medium">
                    Ver detalhes
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
