import { Plus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/format';
import Badge from './ui/Badge';

const categoryIcons = {
  'Eletrônicos': '📱',
  'Moda': '👕',
  'Casa': '🏠',
  'Acessórios': '⌚',
  'default': '📦',
};

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const { success } = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    success(`${product.name} adicionado ao carrinho`);
  };

  const icon = categoryIcons[product.category] || categoryIcons.default;

  return (
    <div
      className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-150 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 animate-fadeInUp"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <a href={`/product/${product.id}`} className="block">
        <div className="relative h-[120px] bg-[var(--bg-muted)] flex items-center justify-center">
          <span className="text-4xl">{icon}</span>
          <Badge
            color="default"
            size="sm"
            className="absolute top-2 right-2"
          >
            {product.category}
          </Badge>
        </div>
        <div className="p-3">
          <h3 className="text-[14px] font-medium text-[var(--text-primary)] truncate">
            {product.name}
          </h3>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
            {product.category}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[16px] font-semibold text-[var(--text-primary)]">
              {formatCurrency(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              className="w-8 h-8 bg-[var(--brand)] text-white rounded-full flex items-center justify-center transition-all hover:bg-[var(--brand-dark)] active:scale-95"
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </a>
    </div>
  );
}
