import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, Calendar } from 'lucide-react';
import { getOrder } from '../api/orders';
import { formatCurrency, formatDate, addBusinessDays } from '../utils/format';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const categoryIcons = {
  'Eletrônicos': '📱',
  'Moda': '👕',
  'Casa': '🏠',
  'Acessórios': '⌚',
  'default': '📦',
};

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrder(id);
        setOrder(data);
      } catch (error) {
        console.error('Erro ao carregar pedido:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <main className="min-h-screen pb-20 md:pb-8 flex items-center justify-center">
        <div className="max-w-[480px] w-full px-4 text-center">
          <Skeleton height="80px" width="80px" rounded="full" className="mx-auto mb-6" />
          <Skeleton height="32px" width="200px" className="mx-auto mb-2" />
          <Skeleton height="20px" width="280px" className="mx-auto mb-8" />
          <Skeleton height="200px" className="mb-4" rounded="lg" />
          <Skeleton height="48px" className="mb-3" />
          <Skeleton height="48px" />
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const deliveryDate = addBusinessDays(new Date(), 5);

  return (
    <main className="min-h-screen pb-20 md:pb-8 flex items-center justify-center">
      <div className="max-w-[480px] w-full px-4 py-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[var(--brand-light)] rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
            <CheckCircle className="w-10 h-10 text-[var(--brand)]" />
          </div>
          <h1 className="font-['DM_Sans'] text-[28px] font-semibold text-[var(--text-primary)]">
            Pedido confirmado!
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-2">
            Seu pedido <span className="font-medium">#{order.id || id}</span> foi recebido com sucesso.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 mb-6">
          {/* Items */}
          <div className="space-y-3 mb-4">
            {(order.items || []).map((item, index) => {
              const icon = categoryIcons[item.category] || categoryIcons.default;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--bg-muted)] rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
                    <span className="text-lg">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                      {item.name}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)]">
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <hr className="border-[var(--border-subtle)] mb-4" />

          {/* Order Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Package className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
              <div>
                <p className="text-[12px] text-[var(--text-tertiary)]">Total pago</p>
                <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                  {formatCurrency(order.total || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
              <div>
                <p className="text-[12px] text-[var(--text-tertiary)]">Método de pagamento</p>
                <p className="text-[14px] font-medium text-[var(--text-primary)]">
                  {order.payment_method === 'pix' ? 'PIX' : 'Cartão de crédito'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
              <div>
                <p className="text-[12px] text-[var(--text-tertiary)]">Endereço de entrega</p>
                <p className="text-[14px] font-medium text-[var(--text-primary)]">
                  {order.shipping_address || 'Endereço não informado'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
              <div>
                <p className="text-[12px] text-[var(--text-tertiary)]">Previsão de entrega</p>
                <p className="text-[14px] font-medium text-[var(--success)]">
                  {formatDate(deliveryDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button fullWidth onClick={() => navigate('/orders')} icon={Package}>
            Ver meus pedidos
          </Button>
          <Button fullWidth variant="ghost" onClick={() => navigate('/')}>
            Continuar comprando
          </Button>
        </div>
      </div>
    </main>
  );
}
