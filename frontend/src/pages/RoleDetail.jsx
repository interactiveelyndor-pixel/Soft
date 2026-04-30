import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Briefcase, Users, AlertCircle, FileText, CheckCircle2, UserPlus, X, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApp, setNewApp] = useState({ name: '', email: '', stage: 'HR Screening' });

  const fetchRole = async () => {
    try {
      const response = await api.get(`/resources/`);
      const found = response.data.find(r => r.id.toString() === id);
      if (found) {
        setRole(found);
      } else {
        toast.error("Role not found");
        navigate('/resources');
      }
    } catch (error) {
      toast.error("Failed to load role data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [id, navigate]);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/resources/${id}/applicants`, newApp);
      toast.success("Candidate added to pipeline");
      setIsModalOpen(false);
      setNewApp({ name: '', email: '', stage: 'HR Screening' });
      fetchRole();
    } catch (e) {
      toast.error("Failed to add candidate");
    }
  };

  const advanceStage = async (applicant, newStage) => {
    try {
      await api.patch(`/resources/${id}/applicants/${applicant.id}`, { stage: newStage });
      toast.success(`${applicant.name} advanced to ${newStage}`);
      fetchRole();
    } catch (e) {
      toast.error("Failed to advance candidate");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!role) return null;

  const openSlots = role.slots_required - role.slots_filled;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Nav */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6">
        <button 
          onClick={() => navigate('/resources')}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-semibold text-white tracking-tight">{role.title}</h1>
            {role.is_urgent && openSlots > 0 && (
              <span className="badge-red py-0.5"><AlertCircle size={12} /> Urgent Hire</span>
            )}
            {openSlots <= 0 && (
              <span className="badge-green py-0.5"><CheckCircle2 size={12} /> Filled</span>
            )}
          </div>
          <p className="text-xs text-zinc-500">Department: {role.department} · Role ID: {role.id}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => toast("Editing job description...")} className="btn-ghost py-2.5 px-4 text-xs font-semibold">
            <FileText size={14} /> Job Description
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary py-2.5 px-5 text-xs font-semibold" disabled={openSlots <= 0}>
            <UserPlus size={14} /> Add Candidate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Col (Stats) */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-heading font-semibold text-white mb-6">Fulfillment Status</h2>
            
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[2.5rem] font-heading font-semibold text-white leading-none">{role.slots_filled}<span className="text-xl text-zinc-600">/{role.slots_required}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{openSlots > 0 ? `${openSlots} Open` : 'Completed'}</p>
              </div>
            </div>
            
            <div className="h-2 bg-[#0a0a0c] rounded-full overflow-hidden border border-white/[0.05] mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(role.slots_filled / role.slots_required) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${openSlots <= 0 ? 'bg-emerald-500' : 'bg-primary'}`}
              />
            </div>

            <div className="p-4 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.01]">
              <p className="text-xs text-zinc-400 leading-relaxed text-center">
                This requisition requires {role.slots_required} operative(s) for the {role.department} department.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-heading font-semibold text-white">Applicant Pipeline</h2>
            </div>
            
            <div className="space-y-3">
              {role.applicants && role.applicants.length > 0 ? role.applicants.map(app => (
                <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                      {app.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{app.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-500">{app.email}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="badge-muted py-0.5 px-2">{app.stage}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => window.location.href=`mailto:${app.email}`} className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <Mail size={16} />
                    </button>
                    {app.stage === 'HR Screening' && (
                      <button onClick={() => advanceStage(app, 'Technical Test')} className="btn-ghost py-1.5 px-3 text-xs">Advance</button>
                    )}
                    {app.stage === 'Technical Test' && (
                      <button onClick={() => advanceStage(app, 'Offer')} className="btn-ghost py-1.5 px-3 text-xs">Advance to Offer</button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]">
                  <Users size={32} className="text-zinc-600 mb-3" />
                  <p className="text-sm font-medium text-white mb-1">Pipeline is empty</p>
                  <p className="text-xs text-zinc-500 mb-4 text-center max-w-sm">There are currently no active candidates in the pipeline for this specific role.</p>
                  <button onClick={() => toast("Publishing to job boards...")} className="btn-ghost py-2 px-4 text-xs border border-white/10">Publish to Job Boards</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
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
                <h2 className="text-xl font-heading font-semibold text-white">Add Candidate</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddCandidate} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Candidate Name</label>
                    <input
                      type="text"
                      required
                      value={newApp.name}
                      onChange={e => setNewApp({...newApp, name: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Candidate Email</label>
                    <input
                      type="email"
                      required
                      value={newApp.email}
                      onChange={e => setNewApp({...newApp, email: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="btn-primary w-full py-3.5 font-semibold">
                    Add to Pipeline
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

export default RoleDetail;
