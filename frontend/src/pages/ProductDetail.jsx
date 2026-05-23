import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Zap } from 'lucide-react';
import { getProduct } from '../api/catalog';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

const categoryIcons = {
  'Eletrônicos': '📱',
  'Moda': '👕',
  'Casa': '🏠',
  'Acessórios': '⌚',
  'default': '📦',
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { success } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    success(`${product.name} adicionado ao carrinho`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/cart');
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const incrementQuantity = () => {
    setQuantity(q => q + 1);
  };

  if (loading) {
    return (
      <main className="min-h-screen pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Skeleton height="20px" width="80px" className="mb-6" />
          <Skeleton height="260px" className="mb-6" rounded="lg" />
          <Skeleton height="28px" width="200px" className="mb-2" />
          <Skeleton height="32px" width="100px" className="mb-4" />
          <Skeleton height="80px" className="mb-6" />
          <Skeleton height="48px" className="mb-3" />
          <Skeleton height="48px" />
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  const icon = categoryIcons[product.category] || categoryIcons.default;

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* Product Image */}
        <div className="relative h-[260px] bg-[var(--bg-muted)] rounded-[var(--radius-lg)] flex items-center justify-center mb-6">
          <span className="text-7xl">{icon}</span>
          <Badge
            color="default"
            size="md"
            className="absolute top-4 right-4"
          >
            {product.category}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <h1 className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--text-primary)]">
            {product.name}
          </h1>
          <p className="text-[28px] font-semibold text-[var(--brand)] mt-2">
            {formatCurrency(product.price)}
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            {product.description || 'Este produto combina qualidade e design moderno, perfeito para o seu dia a dia. Fabricado com materiais de alta durabilidade, oferece excelente custo-benefício.'}
          </p>
        </div>

        <hr className="border-[var(--border-subtle)] mb-6" />

        {/* Quantity Selector */}
        <div className="mb-6">
          <p className="text-[14px] font-medium text-[var(--text-primary)] mb-3">Quantidade</p>
          <div className="inline-flex items-center border border-[var(--border-default)] rounded-[var(--radius-md)]">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-[14px] font-medium text-[var(--text-primary)]">
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button fullWidth icon={ShoppingCart} onClick={handleAddToCart}>
            Adicionar ao carrinho
          </Button>
          <Button fullWidth variant="ghost" icon={Zap} onClick={handleBuyNow}>
            Comprar agora
          </Button>
        </div>
      </div>
    </main>
  );
}
