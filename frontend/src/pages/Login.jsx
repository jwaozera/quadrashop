import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Zap, Shield, Truck } from 'lucide-react';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateEmail, validatePassword } from '../utils/format';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const features = [
  { icon: Zap, text: 'Compras rápidas e seguras' },
  { icon: Shield, text: 'Proteção de dados garantida' },
  { icon: Truck, text: 'Entrega em todo o Brasil' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { error: showError } = useToast();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await loginApi(formData.email, formData.password);
      login(response.access_token, response.user);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.detail || 'Erro ao fazer login. Tente novamente.';
      setApiError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (apiError) setApiError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--bg-muted)] relative overflow-hidden">
        {/* Geometric pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, var(--text-primary) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <h1 className="font-['DM_Sans'] text-[36px] font-semibold text-[var(--text-primary)]">
              Quadra<span className="text-[var(--brand)]">Shop</span>
              <span className="text-[var(--brand)]">.</span>
            </h1>
            <p className="text-[18px] text-[var(--text-secondary)] mt-2">
              Tudo que você quer, em um clique.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--brand-light)] rounded-[var(--radius-md)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--brand)]" />
                </div>
                <span className="text-[14px] text-[var(--text-secondary)]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--bg-base)]">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-['DM_Sans'] text-[28px] font-semibold text-[var(--text-primary)]">
              Quadra<span className="text-[var(--brand)]">Shop</span>
              <span className="text-[var(--brand)]">.</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="font-['DM_Sans'] text-[28px] font-semibold text-[var(--text-primary)]">
              Bem-vindo de volta
            </h2>
            <p className="text-[14px] text-[var(--text-secondary)] mt-2">
              Entre com sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              type="password"
              label="Senha"
              icon={Lock}
              value={formData.password}
              onChange={handleChange('password')}
              error={errors.password}
              autoComplete="current-password"
            />

            {apiError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-[var(--error)] rounded-[var(--radius-md)]">
                <AlertCircle className="w-4 h-4 text-[var(--error)] shrink-0" />
                <span className="text-[13px] text-[var(--error)]">{apiError}</span>
              </div>
            )}

            <Button type="submit" fullWidth loading={loading}>
              Entrar
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-[13px] text-[var(--text-tertiary)] bg-[var(--bg-base)]">
                ou
              </span>
            </div>
          </div>

          <p className="text-center text-[14px] text-[var(--text-secondary)]">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="text-[var(--brand)] font-medium hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
