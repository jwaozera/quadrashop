import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingCart, Package, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/search', icon: Search, label: 'Buscar' },
  { to: '/cart', icon: ShoppingCart, label: 'Carrinho', showBadge: true },
  { to: '/orders', icon: Package, label: 'Pedidos' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
  const { itemCount } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label, showBadge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 px-3 py-2
              transition-colors
              ${isActive ? 'text-[var(--brand)]' : 'text-[var(--text-tertiary)]'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {showBadge && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--brand)] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] ${isActive ? 'font-medium' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
