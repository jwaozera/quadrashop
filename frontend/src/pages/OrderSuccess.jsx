import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">

      {/* Check icon with scale-in animation */}
      <div className="w-24 h-24 rounded-full bg-[var(--brand-light)] flex items-center justify-center mb-8 animate-scaleIn">
        <CheckCircle className="w-12 h-12 text-[var(--brand)]" strokeWidth={1.5} />
      </div>

      {/* Text block */}
      <div className="text-center max-w-sm animate-fadeInUp" style={{ animationDelay: '150ms' }}>
        <h1 className="font-['DM_Sans'] text-[28px] font-semibold text-[var(--text-primary)] mb-3">
          Pedido Confirmado!
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Seu pedido está sendo processado. Em breve você receberá os detalhes de acompanhamento no e-mail{' '}
          <span className="font-medium text-[var(--text-primary)]">
            {user?.email || 'cadastrado'}
          </span>.
        </p>
      </div>

      {/* Divider */}
      <div className="w-16 h-px bg-[var(--border-subtle)] my-8" />

      {/* Action buttons */}
      <div
        className="flex flex-col sm:flex-row gap-3 w-full max-w-xs animate-fadeInUp"
        style={{ animationDelay: '250ms' }}
      >
        <Button
          fullWidth
          icon={ShoppingBag}
          onClick={() => navigate('/')}
        >
          Continuar Comprando
        </Button>
        <Button
          fullWidth
          variant="ghost"
          icon={Package}
          onClick={() => navigate('/orders')}
        >
          Ver meus pedidos
        </Button>
      </div>
    </main>
  );
}
