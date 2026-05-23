import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';

const categoryIcons = {
  'Eletrônicos': '📱',
  'Moda': '👕',
  'Casa': '🏠',
  'Acessórios': '⌚',
  'default': '📦',
};

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const { success, info } = useToast();
  const [removingId, setRemovingId] = useState(null);

  const shipping = total >= 199 ? 0 : 12.90;
  const finalTotal = total + shipping;

  const handleRemove = (item) => {
    setRemovingId(item.id);
    setTimeout(() => {
      removeItem(item.id);
      info(`${item.name} removido do carrinho`);
      setRemovingId(null);
    }, 300);
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      handleRemove(item);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-[var(--text-tertiary)]" />
          </div>
          <h1 className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--text-primary)] mb-2">
            Seu carrinho está vazio
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mb-8">
            Adicione produtos para continuar comprando
          </p>
          <Button onClick={() => navigate('/')} icon={ShoppingBag}>
            Explorar produtos
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--text-primary)] mb-6">
          Meu carrinho <span className="text-[var(--text-tertiary)] font-normal">({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
        </h1>

        <div className="lg:grid lg:grid-cols-[1fr,360px] lg:gap-8">
          {/* Cart Items */}
          <div className="space-y-4 mb-8 lg:mb-0">
            {items.map((item) => {
              const icon = categoryIcons[item.category] || categoryIcons.default;
              const isRemoving = removingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`
                    flex gap-4 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)]
                    transition-all duration-300
                    ${isRemoving ? 'animate-slideOut opacity-0' : ''}
                  `}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-[var(--bg-muted)] rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                    <span className="text-2xl">{icon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                      {item.name}
                    </h3>
                    <p className="text-[12px] text-[var(--text-tertiary)]">
                      {item.category}
                    </p>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[var(--border-default)] rounded-[var(--radius-sm)]">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-[13px] font-medium text-[var(--text-primary)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item)}
                    className="p-2 text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors self-start"
                    aria-label={`Remover ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
              <h2 className="font-['DM_Sans'] text-[18px] font-semibold text-[var(--text-primary)] mb-4">
                Resumo do pedido
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span className="text-[var(--text-primary)]">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--text-secondary)]">Frete</span>
                  <span className={shipping === 0 ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}>
                    {shipping === 0 ? 'Grátis' : formatCurrency(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    Frete grátis em compras acima de R$ 199
                  </p>
                )}
              </div>

              <hr className="border-[var(--border-subtle)] mb-4" />

              <div className="flex justify-between text-[16px] font-semibold mb-6">
                <span className="text-[var(--text-primary)]">Total</span>
                <span className="text-[var(--text-primary)]">{formatCurrency(finalTotal)}</span>
              </div>

              <Button 
                fullWidth 
                icon={ArrowRight} 
                onClick={() => navigate('/checkout')}
              >
                Ir para o checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
