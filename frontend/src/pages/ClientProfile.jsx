import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Globe, Building2, Calendar, FileText, ArrowUpRight, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [newComm, setNewComm] = useState({ title: '', notes: '' });

  const fetchClientData = async () => {
    try {
      const [clientRes, projectsRes] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/clients/${id}/projects`)
      ]);
      setClient(clientRes.data);
      setActiveProjects(projectsRes.data);
    } catch (error) {
      toast.error("Failed to load client profile");
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id, navigate]);

  const handleLogComm = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/clients/${id}/communications`, newComm);
      toast.success("Interaction logged successfully");
      setNewComm({ title: '', notes: '' });
      setIsCommModalOpen(false);
      fetchClientData();
    } catch (error) {
      toast.error("Failed to log interaction");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Nav */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6">
        <button 
          onClick={() => navigate('/clients')}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-semibold text-white tracking-tight">{client.name}</h1>
            <span className={client.status === 'active' ? 'badge-green' : 'badge-muted'}>
              {client.status === 'active' ? 'Active Partner' : 'Past Client'}
            </span>
          </div>
          <p className="text-xs text-zinc-500">Client ID: {client.id} · Onboarded Recently</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => window.location.href = `mailto:${client.email}`} className="btn-ghost py-2.5 px-4 text-xs font-semibold">
            <Mail size={14} /> Send Email
          </button>
          <button onClick={() => setIsCommModalOpen(true)} className="btn-primary py-2.5 px-5 text-xs font-semibold">
            <MessageSquare size={14} /> Log Interaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Col (Details) */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-2xl font-bold font-heading mb-6">
              {client.name.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 size={16} className="text-zinc-500 mt-0.5" />
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Industry</p>
                  <p className="text-sm font-medium text-white">{client.industry || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-zinc-500 mt-0.5" />
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Contact Email</p>
                  <p className="text-sm font-medium text-white">{client.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe size={16} className="text-zinc-500 mt-0.5" />
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Website</p>
                  <p className="text-sm font-medium text-accent cursor-pointer hover:underline">www.{client.name.toLowerCase().replace(/\s/g, '')}.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="xl:col-span-2 space-y-6">
          {/* Active Projects for this client */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-heading font-semibold text-white">Active Contracts / Projects</h2>
            </div>
            
            <div className="space-y-3">
              {activeProjects.length > 0 ? activeProjects.map(p => (
                <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><FileText size={14} /></div>
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.project_type || 'Project'}</p>
                    </div>
                  </div>
                  <span className="badge-green">Active</span>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]">
                  <FileText size={32} className="text-zinc-600 mb-3" />
                  <p className="text-sm font-medium text-white mb-1">No active projects</p>
                  <p className="text-xs text-zinc-500 mb-4">This client currently has no ongoing production cycles.</p>
                  <button onClick={() => navigate('/projects')} className="btn-primary py-2 px-4 text-xs">Link Project</button>
                </div>
              )}
            </div>
          </div>

          {/* Communication History */}
          <div className="card p-6">
            <h2 className="text-sm font-heading font-semibold text-white mb-6">Communication Log</h2>
            <div className="space-y-6">
              {client.communications && client.communications.length > 0 ? client.communications.slice().reverse().map((comm, i) => (
                <div key={comm.id} className="flex gap-4 relative">
                  {i !== client.communications.length - 1 && <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-white/[0.05]" />}
                  <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 z-10">
                    <Calendar size={14} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">{comm.title}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{comm.notes}</p>
                    <p className="text-[10px] text-zinc-600 mt-2">{new Date(comm.created_at).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <div className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 z-10">
                    <Calendar size={14} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">Client Onboarded</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">Profile created in the CRM system.</p>
                    <p className="text-[10px] text-zinc-600 mt-2">{new Date(client.created_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Log Interaction Modal */}
      <AnimatePresence>
        {isCommModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-white">Log Client Interaction</h2>
                <button onClick={() => setIsCommModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleLogComm} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Interaction Title</label>
                    <input
                      type="text"
                      required
                      value={newComm.title}
                      onChange={e => setNewComm({...newComm, title: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                      placeholder="e.g. Q3 Roadmap Review"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Meeting Notes</label>
                    <textarea
                      required
                      rows={4}
                      value={newComm.notes}
                      onChange={e => setNewComm({...newComm, notes: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                      placeholder="Summary of what was discussed..."
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="btn-primary w-full py-3.5 font-semibold">
                    Save Record
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

export default ClientProfile;
