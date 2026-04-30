import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, History, ExternalLink, UserPlus, ArrowUpRight, TrendingUp, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ClientPanel = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    industry: '',
    status: 'active'
  });

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/clients/', newClient);
      setIsModalOpen(false);
      setNewClient({ name: '', email: '', industry: '', status: 'active' });
      navigate(`/clients/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to onboard client');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this client?')) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = clients.filter(c => c.status === 'active').length;
  const pastCount = clients.filter(c => c.status !== 'active').length;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="label mb-1.5">Business Development</p>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Client Management</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs"
        >
          <UserPlus size={15} />
          Onboard New Client
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Active Clients', value: activeCount.toString(), icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Past Clients', value: pastCount.toString(), icon: History, color: 'text-zinc-400' },
          { label: 'Network Reach', value: 'High', icon: ArrowUpRight, color: 'text-accent' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`mb-4 ${color}`}><Icon size={18} /></div>
            <p className="label mb-1">{label}</p>
            <p className="text-2xl font-heading font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-7 py-5 border-b border-white/[0.06]">
          <h2 className="text-base font-heading font-semibold text-white">All Clients</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-7 py-4 text-left label">Client</th>
                <th className="px-7 py-4 text-left label">Industry</th>
                <th className="px-7 py-4 text-left label">Status</th>
                <th className="px-7 py-4 text-left label">Email</th>
                <th className="px-7 py-4 text-right label">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {clients.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center text-accent text-xs font-bold font-heading flex-shrink-0">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white group-hover:text-accent transition-colors">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-7 py-5 text-sm text-zinc-400">{c.industry || 'Unknown'}</td>
                  <td className="px-7 py-5">
                    <span className={c.status === 'active' ? 'badge-green py-1' : 'badge-muted py-1'}>
                      {c.status === 'active' ? 'Active' : 'Past'}
                    </span>
                  </td>
                  <td className="px-7 py-5 text-sm text-zinc-500 font-mono">{c.email}</td>
                  <td className="px-7 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); toast("Opening mail client..."); }} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-colors"><Mail size={15} /></button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(c.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toast.info(`Viewing CRM profile for ${c.name}`); }} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-colors"><ExternalLink size={15} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-white">Onboard New Client</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Client / Company Name</label>
                    <input
                      type="text"
                      required
                      value={newClient.name}
                      onChange={e => setNewClient({...newClient, name: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                      placeholder="e.g. Epic Games"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Contact Email</label>
                    <input
                      type="email"
                      required
                      value={newClient.email}
                      onChange={e => setNewClient({...newClient, email: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                      placeholder="partner@epicgames.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Industry</label>
                    <input
                      type="text"
                      value={newClient.industry}
                      onChange={e => setNewClient({...newClient, industry: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 transition-all"
                      placeholder="e.g. Gaming / Entertainment"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="btn-primary w-full py-3.5 font-semibold">
                    Complete Onboarding
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientPanel;
