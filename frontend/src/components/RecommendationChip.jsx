import { Plus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/format';

const categoryIcons = {
  'Eletrônicos': '📱',
  'Moda': '👕',
  'Casa': '🏠',
  'Acessórios': '⌚',
  'default': '📦',
};

export default function RecommendationChip({ product }) {
  const { addItem } = useCart();
  const { success } = useToast();

  const handleAdd = () => {
    addItem(product);
    success(`${product.name} adicionado ao carrinho`);
  };

  const icon = categoryIcons[product.category] || categoryIcons.default;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-full)] whitespace-nowrap">
      <span className="text-xl">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-[var(--text-primary)]">
          {product.name}
        </span>
        <span className="text-[12px] text-[var(--brand)] font-medium">
          {formatCurrency(product.price)}
        </span>
      </div>
      <button
        onClick={handleAdd}
        className="w-6 h-6 bg-[var(--brand)] text-white rounded-full flex items-center justify-center transition-all hover:bg-[var(--brand-dark)] active:scale-95"
        aria-label={`Adicionar ${product.name}`}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}
