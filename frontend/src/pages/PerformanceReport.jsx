import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ShieldAlert, UserMinus, Activity, Award, AlertTriangle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const zoneMeta = {
  green: { badge: 'badge-green', label: 'Optimal', icon: ShieldCheck, bar: 'bg-emerald-500' },
  red: { badge: 'badge-red', label: 'At Risk', icon: ShieldAlert, bar: 'bg-red-500' },
  black: { badge: 'badge-muted', label: 'Terminated', icon: UserMinus, bar: 'bg-zinc-600' },
};

const PerformanceReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerf = async () => {
      try {
        const response = await api.get(`/performance/`);
        const found = response.data.find(p => p.id.toString() === id);
        if (found) {
          setPerf(found);
        } else {
          toast.error("Performance record not found");
          navigate('/performance');
        }
      } catch (error) {
        toast.error("Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };
    fetchPerf();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!perf) return null;

  const meta = zoneMeta[perf.zone] || zoneMeta.black;
  const Icon = meta.icon;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Nav */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6">
        <button 
          onClick={() => navigate('/performance')}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-semibold text-white tracking-tight">{perf.user_name}</h1>
            <span className={meta.badge}>
              <Icon size={13} /> {meta.label}
            </span>
          </div>
          <p className="text-xs text-zinc-500">{perf.user_department || 'Operative'} · Record ID: {perf.id}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => toast("Opening communication channel...")} className="btn-ghost py-2.5 px-4 text-xs font-semibold">
            <MessageSquare size={14} /> Contact
          </button>
          <button onClick={() => toast("Exporting official HR report...")} className="btn-primary py-2.5 px-5 text-xs font-semibold">
            <Activity size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-8">
            <h2 className="text-sm font-heading font-semibold text-white mb-8">Performance Metrics</h2>
            
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <p className="label mb-2">Efficiency Score</p>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-heading font-bold text-white leading-none">{perf.score}</p>
                  <p className="text-sm font-medium text-zinc-500 mb-1">/ 100</p>
                </div>
              </div>
              <div>
                <p className="label mb-2">System Assessment</p>
                <p className={`text-lg font-medium ${perf.zone === 'green' ? 'text-emerald-400' : perf.zone === 'red' ? 'text-red-400' : 'text-zinc-500'}`}>
                  {perf.zone === 'green' ? 'Exceeding Expectations' : perf.zone === 'red' ? 'Critical Intervention Required' : 'Archived / Terminated'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>0</span>
                <span>Optimal Threshold (70)</span>
                <span>100</span>
              </div>
              <div className="h-4 bg-[#0a0a0c] rounded-full overflow-hidden border border-white/[0.05] relative">
                <div className="absolute left-[70%] top-0 bottom-0 w-px bg-white/20 z-10" />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${perf.score}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={`h-full rounded-full relative ${meta.bar}`}
                >
                  <div className="absolute inset-0 bg-white/20 blur-sm" />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="card p-8">
             <h2 className="text-sm font-heading font-semibold text-white mb-6">AI Evaluation Summary</h2>
             <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
               <p className="text-sm text-zinc-300 leading-relaxed">
                 {perf.zone === 'green' 
                    ? "Operative is demonstrating exceptional output. Code quality and milestone delivery are consistently above baseline metrics. Recommend for potential leadership track or specialized project assignment."
                    : perf.zone === 'red'
                    ? "Warning: Operative efficiency has dropped below acceptable thresholds. Delays in milestone delivery noted over the last sprint. Immediate HR intervention and 1-on-1 review recommended to identify blockers."
                    : "Operative profile has been locked. No active metrics are being tracked."}
               </p>
             </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-heading font-semibold text-white mb-5">HR Action Center</h2>
            <div className="space-y-3">
              <button onClick={() => toast.success("Commendation logged.")} disabled={perf.zone !== 'green'} className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Award size={16} />
                  <span className="text-xs font-semibold">Issue Commendation</span>
                </div>
              </button>
              
              <button onClick={() => toast.warning("Warning issued.")} disabled={perf.zone === 'black'} className="w-full flex items-center justify-between p-4 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 text-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-semibold">Issue Formal Warning</span>
                </div>
              </button>

              <button onClick={() => toast.error("Termination protocol initiated.")} disabled={perf.zone === 'black'} className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <UserMinus size={16} />
                  <span className="text-xs font-semibold">Initiate Termination</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
