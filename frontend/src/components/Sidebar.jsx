import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid, Gamepad2, Users, Briefcase, BarChart3, LogOut,
  Terminal, Settings, ChevronRight
} from 'lucide-react';

const Sidebar = ({ role, onLogout }) => {
  const isCEO = role === 'ceo';

  const ceoLinks = [
    { icon: LayoutGrid, label: 'Dashboard', to: '/dashboard' },
    { icon: Gamepad2, label: 'Projects', to: '/projects' },
    { icon: Users, label: 'Clients', to: '/clients' },
    { icon: Briefcase, label: 'Resources', to: '/resources' },
    { icon: BarChart3, label: 'Performance', to: '/performance' },
  ];

  const internLinks = [
    { icon: Terminal, label: 'My Portal', to: '/intern' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  const links = isCEO ? ceoLinks : internLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#060608] border-r border-white/[0.06] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-heading font-bold text-sm">E</span>
          </div>
          <div>
            <p className="text-white font-heading font-semibold text-sm tracking-wide">Elyndor</p>
            <p className="text-zinc-600 text-[10px] tracking-widest uppercase">Studio OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="label px-3 mb-4">Navigation</p>
        {links.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">
            {isCEO ? 'M' : 'E'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium truncate">{isCEO ? 'Monish' : 'Operative'}</p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest truncate">{isCEO ? 'CEO & Founder' : 'Intern'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="sidebar-link text-zinc-600 hover:text-danger w-full"
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
