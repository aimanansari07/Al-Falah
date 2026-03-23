import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Clock, Star, Bell, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TABS = [
  { to: '/',              Icon: Home,        label: 'Home'    },
  { to: '/prayers',       Icon: Clock,       label: 'Prayers' },
  { to: '/special',       Icon: Star,        label: 'Special' },
  { to: '/announcements', Icon: Bell,        label: 'News'    },
  { to: null,             Icon: LayoutGrid,  label: 'More'    },
];

export default function BottomNav() {
  const { setShowMenuSheet } = useApp();
  const location = useLocation();

  return (
    <nav
      className="bg-white border-t border-[#EEEBE4] shrink-0 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex">
        {TABS.map(({ to, Icon, label }) => {
          const isMenu   = to === null;
          const isActive = !isMenu && location.pathname === to;

          if (isMenu) {
            return (
              <button
                key="more"
                onClick={() => setShowMenuSheet(true)}
                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 min-h-[58px] active:bg-gray-50"
              >
                <Icon size={22} strokeWidth={1.8} className="text-[#9CA3AF]" />
                <span className="text-[11px] font-medium text-[#9CA3AF]">{label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 min-h-[58px] relative active:bg-gray-50"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute top-0 inset-x-4 h-[3px] bg-primary rounded-b-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? 'text-primary' : 'text-[#9CA3AF]'}
              />
              <span className={`text-[11px] ${isActive ? 'font-bold text-primary' : 'font-medium text-[#9CA3AF]'}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
