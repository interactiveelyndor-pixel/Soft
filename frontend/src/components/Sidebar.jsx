import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid, Gamepad2, Users, Briefcase, BarChart3, LogOut,
  Terminal, Settings, Contact, Bell, Check
} from 'lucide-react';
import api from '../services/api';

const Sidebar = ({ role, onLogout }) => {
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const isCEO = role === 'ceo';

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/');
        setNotifications(res.data);
      } catch (e) {}
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {}
  };

  const ceoLinks = [
    { icon: LayoutGrid, label: 'Dashboard', to: '/dashboard' },
    { icon: Gamepad2, label: 'Projects', to: '/projects' },
    { icon: Users, label: 'Clients', to: '/clients' },
    { icon: Contact, label: 'Directory', to: '/team' },
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
      {/* Logo and Bell */}
      <div className="px-6 py-7 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-heading font-bold text-sm">E</span>
          </div>
          <div>
            <p className="text-white font-heading font-semibold text-sm tracking-wide">Elyndor</p>
            <p className="text-zinc-600 text-[10px] tracking-widest uppercase">Studio OS</p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-zinc-500 hover:text-white transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#060608]" />
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[#0c0c0e] border border-white/[0.08] rounded-xl shadow-2xl z-[100] overflow-hidden">
              <div className="p-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
                <span className="text-xs font-semibold text-white">Notifications</span>
                {unreadCount > 0 && <span className="badge-muted">{unreadCount} New</span>}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-3 border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.02] transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}>
                    <p className={`text-xs ${!n.is_read ? 'text-white font-medium' : 'text-zinc-400'}`}>{n.message}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                )) : (
                  <p className="text-xs text-zinc-500 p-4 text-center">No notifications</p>
                )}
              </div>
            </div>
          )}
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
