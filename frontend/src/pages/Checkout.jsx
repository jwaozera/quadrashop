import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatCEP, formatCardNumber, formatExpiry, formatCVV } from '../utils/format';
import { checkout } from '../api/orders';
import { processPayment } from '../api/payment';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const categoryIcons = {
  'Eletrônicos': '📱',
  'Moda': '👕',
  'Casa': '🏠',
  'Acessórios': '⌚',
  'default': '📦',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { success, error: showError } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [pixTimer, setPixTimer] = useState(300);

  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({});

  const shipping = total >= 199 ? 0 : 12.90;
  const finalTotal = total + shipping;

  // PIX countdown timer
  useEffect(() => {
    if (paymentMethod !== 'pix' || pixTimer <= 0) return;
    const timer = setInterval(() => {
      setPixTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentMethod, pixTimer]);

  // Fetch address from CEP
  const fetchAddressFromCEP = async (cep) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setAddress(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  };

  const handleAddressChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'cep') {
      value = formatCEP(value);
      if (value.replace(/\D/g, '').length === 8) {
        fetchAddressFromCEP(value);
      }
    }
    setAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCardChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'number') value = formatCardNumber(value);
    if (field === 'expiry') value = formatExpiry(value);
    if (field === 'cvv') value = formatCVV(value);
    setCard(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Address validation
    if (!address.cep || address.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP inválido';
    }
    if (!address.street.trim()) newErrors.street = 'Endereço é obrigatório';
    if (!address.number.trim()) newErrors.number = 'Número é obrigatório';
    if (!address.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!address.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!address.state.trim()) newErrors.state = 'Estado é obrigatório';

    // Card validation (only if card payment)
    if (paymentMethod === 'card') {
      if (!card.number || card.number.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Número do cartão inválido';
      }
      if (!card.name.trim()) newErrors.cardName = 'Nome é obrigatório';
      if (!card.expiry || card.expiry.length !== 5) {
        newErrors.cardExpiry = 'Validade inválida';
      }
      if (!card.cvv || card.cvv.length !== 3) {
        newErrors.cardCvv = 'CVV inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Create order
      const orderResponse = await checkout(
        `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.cep}`,
        paymentMethod
      );

      // Process payment
      const paymentResponse = await processPayment(
        orderResponse.order_id,
        paymentMethod,
        finalTotal
      );

      if (paymentResponse.status === 'approved') {
        clearCart();
        success('Pedido realizado com sucesso!');
        navigate(`/order/${orderResponse.order_id}`);
      } else {
        showError('Pagamento recusado. Tente outro cartão.');
      }
    } catch (err) {
      showError(err.response?.data?.detail || 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--text-primary)] mb-6">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="lg:grid lg:grid-cols-[1fr,380px] lg:gap-8">
            {/* Left Column - Form */}
            <div className="space-y-8 mb-8 lg:mb-0">
              {/* Delivery Section */}
              <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
                <h2 className="font-['DM_Sans'] text-[18px] font-semibold text-[var(--text-primary)] mb-4">
                  Entrega
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="CEP"
                    value={address.cep}
                    onChange={handleAddressChange('cep')}
                    error={errors.cep}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  <div />
                  <Input
                    label="Endereço"
                    value={address.street}
                    onChange={handleAddressChange('street')}
                    error={errors.street}
                    className="col-span-2"
                  />
                  <Input
                    label="Número"
                    value={address.number}
                    onChange={handleAddressChange('number')}
                    error={errors.number}
                  />
                  <Input
                    label="Complemento"
                    value={address.complement}
                    onChange={handleAddressChange('complement')}
                    placeholder="Opcional"
                  />
                  <Input
                    label="Bairro"
                    value={address.neighborhood}
                    onChange={handleAddressChange('neighborhood')}
                    error={errors.neighborhood}
                  />
                  <Input
                    label="Cidade"
                    value={address.city}
                    onChange={handleAddressChange('city')}
                    error={errors.city}
                  />
                  <Input
                    label="Estado"
                    value={address.state}
                    onChange={handleAddressChange('state')}
                    error={errors.state}
                    maxLength={2}
                    className="uppercase"
                  />
                </div>
              </section>

              {/* Payment Section */}
              <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
                <h2 className="font-['DM_Sans'] text-[18px] font-semibold text-[var(--text-primary)] mb-4">
                  Pagamento
                </h2>

                {/* Payment Method Toggle */}
                <div className="flex gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-3 rounded-[var(--radius-md)] border transition-all
                      ${paymentMethod === 'card'
                        ? 'bg-[var(--brand-light)] border-[var(--brand)] text-[var(--brand)]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-focus)]'
                      }
                    `}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[14px] font-medium">Cartão de crédito</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-3 rounded-[var(--radius-md)] border transition-all
                      ${paymentMethod === 'pix'
                        ? 'bg-[var(--brand-light)] border-[var(--brand)] text-[var(--brand)]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-focus)]'
                      }
                    `}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-[14px] font-medium">PIX</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <Input
                      label="Número do cartão"
                      value={card.number}
                      onChange={handleCardChange('number')}
                      error={errors.cardNumber}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                    <Input
                      label="Nome no cartão"
                      value={card.name}
                      onChange={handleCardChange('name')}
                      error={errors.cardName}
                      className="uppercase"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Validade"
                        value={card.expiry}
                        onChange={handleCardChange('expiry')}
                        error={errors.cardExpiry}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                      <Input
                        label="CVV"
                        value={card.cvv}
                        onChange={handleCardChange('cvv')}
                        error={errors.cardCvv}
                        placeholder="000"
                        maxLength={3}
                        type="password"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-40 h-40 bg-[var(--bg-muted)] rounded-[var(--radius-md)] mx-auto mb-4 flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-[var(--text-tertiary)]" />
                    </div>
                    <p className="text-[14px] text-[var(--text-secondary)] mb-2">
                      Chave PIX: <span className="font-mono font-medium">quadrashop@email.com</span>
                    </p>
                    <p className="text-[13px] text-[var(--text-tertiary)]">
                      Tempo restante: <span className="font-medium text-[var(--brand)]">{formatTime(pixTimer)}</span>
                    </p>
                  </div>
                )}
              </section>

              {/* Submit Button (Mobile) */}
              <div className="lg:hidden">
                <Button type="submit" fullWidth loading={loading}>
                  {loading ? 'Processando...' : 'Finalizar pedido'}
                </Button>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
                <h2 className="font-['DM_Sans'] text-[18px] font-semibold text-[var(--text-primary)] mb-4">
                  Resumo
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {items.map((item) => {
                    const icon = categoryIcons[item.category] || categoryIcons.default;
                    return (
                      <div key={item.id} className="flex items-center gap-3">
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

                {/* Totals */}
                <div className="space-y-2 mb-4">
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
                </div>

                <hr className="border-[var(--border-subtle)] mb-4" />

                <div className="flex justify-between text-[16px] font-semibold mb-6">
                  <span className="text-[var(--text-primary)]">Total</span>
                  <span className="text-[var(--text-primary)]">{formatCurrency(finalTotal)}</span>
                </div>

                {/* Security Badge */}
                <Badge color="success" className="w-full justify-center mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  Compra segura
                </Badge>

                {/* Submit Button (Desktop) */}
                <div className="hidden lg:block">
                  <Button type="submit" fullWidth loading={loading}>
                    {loading ? 'Processando...' : 'Finalizar pedido'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
