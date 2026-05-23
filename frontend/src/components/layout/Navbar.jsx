import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1">
          <span className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--text-primary)]">
            Quadra
          </span>
          <span className="font-['DM_Sans'] text-[22px] font-semibold text-[var(--brand)]">
            Shop
          </span>
          <span className="text-[var(--brand)] text-[22px]">.</span>
        </Link>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full px-4 py-2 pl-10 bg-[var(--bg-muted)] border border-transparent rounded-[var(--radius-full)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand)] focus:outline-none transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--brand)] text-white text-[11px] font-medium rounded-full flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Menu do usuário"
            >
              <div className="w-8 h-8 bg-[var(--brand-light)] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-[var(--brand)]" />
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] py-1 animate-fadeInUp">
                <div className="px-4 py-2 border-b border-[var(--border-subtle)]">
                  <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-[12px] text-[var(--text-tertiary)] truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  to="/orders"
                  className="flex items-center gap-2 px-4 py-2 text-[14px] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Package className="w-4 h-4" />
                  Meus pedidos
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-[var(--error)] hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
