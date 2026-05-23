import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Zap,
  Shield,
  Truck,
} from "lucide-react";
import { register as registerApi } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { validateEmail, validatePassword } from "../utils/format";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const features = [
  { icon: Zap, text: "Compras rápidas e seguras" },
  { icon: Shield, text: "Proteção de dados garantida" },
  { icon: Truck, text: "Entrega em todo o Brasil" },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { error: showError, success } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await registerApi(
        formData.name,
        formData.email,
        formData.password,
      );
      login(response.access_token, response.user);
      success("Conta criada com sucesso!");
      navigate("/");
    } catch (err) {
      // Mensagem de erro mais robusta: aceita detail como string, lista de erros, ou objeto
      const data = err.response?.data;
      let message = "Erro ao criar conta. Tente novamente.";
      if (data) {
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            // FastAPI retorna lista de erros de validação
            message = data.detail.map((d) => d.msg || d).join(" | ");
          } else {
            message = data.detail;
          }
        } else if (typeof data === "string") {
          message = data;
        } else {
          try {
            message = JSON.stringify(data);
          } catch (_e) {
            message = String(data);
          }
        }
      }

      setApiError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (apiError) setApiError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--bg-muted)] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, var(--text-primary) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

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
                <span className="text-[14px] text-[var(--text-secondary)]">
                  {text}
                </span>
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
              Criar conta
            </h2>
            <p className="text-[14px] text-[var(--text-secondary)] mt-2">
              Preencha seus dados para começar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Nome completo"
              icon={User}
              value={formData.name}
              onChange={handleChange("name")}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              type="email"
              label="Email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange("email")}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              type="password"
              label="Senha"
              icon={Lock}
              value={formData.password}
              onChange={handleChange("password")}
              error={errors.password}
              autoComplete="new-password"
            />

            <Input
              type="password"
              label="Confirmar senha"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            {apiError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-[var(--error)] rounded-[var(--radius-md)]">
                <AlertCircle className="w-4 h-4 text-[var(--error)] shrink-0" />
                <span className="text-[13px] text-[var(--error)]">
                  {apiError}
                </span>
              </div>
            )}

            <Button type="submit" fullWidth loading={loading}>
              Criar conta
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
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-[var(--brand)] font-medium hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
