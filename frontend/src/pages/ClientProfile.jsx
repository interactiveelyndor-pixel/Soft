import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Globe, Building2, Calendar, FileText, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await api.get(`/clients/`);
        const found = response.data.find(c => c.id.toString() === id);
        if (found) {
          setClient(found);
        } else {
          toast.error("Client not found");
          navigate('/clients');
        }
      } catch (error) {
        toast.error("Failed to load client data");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id, navigate]);

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
          <button onClick={() => toast("Opening mail client...")} className="btn-ghost py-2.5 px-4 text-xs font-semibold">
            <Mail size={14} /> Send Email
          </button>
          <button onClick={() => toast("Drafting new contract...")} className="btn-primary py-2.5 px-5 text-xs font-semibold">
            <FileText size={14} /> New Contract
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
              <button className="btn-ghost py-1.5 px-3 text-xs">View All</button>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]">
              <FileText size={32} className="text-zinc-600 mb-3" />
              <p className="text-sm font-medium text-white mb-1">No active projects</p>
              <p className="text-xs text-zinc-500 mb-4">This client currently has no ongoing production cycles.</p>
              <button onClick={() => toast("Navigating to project creation...")} className="btn-primary py-2 px-4 text-xs">Link Project</button>
            </div>
          </div>

          {/* Communication History */}
          <div className="card p-6">
            <h2 className="text-sm font-heading font-semibold text-white mb-6">Communication Log</h2>
            <div className="space-y-6">
              <div className="flex gap-4 relative">
                <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-white/[0.05]" />
                <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0 z-10">
                  <Calendar size={14} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">Client Onboarded</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">Profile created in the CRM system.</p>
                  <p className="text-[10px] text-zinc-600 mt-2">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
