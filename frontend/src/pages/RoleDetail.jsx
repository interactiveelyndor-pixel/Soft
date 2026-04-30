import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, Users, AlertCircle, FileText, CheckCircle2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchRole();
  }, [id, navigate]);

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
          <button onClick={() => toast("Opening applicant portal...")} className="btn-primary py-2.5 px-5 text-xs font-semibold" disabled={openSlots <= 0}>
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
            
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]">
              <Users size={32} className="text-zinc-600 mb-3" />
              <p className="text-sm font-medium text-white mb-1">Pipeline is empty</p>
              <p className="text-xs text-zinc-500 mb-4 text-center max-w-sm">There are currently no active candidates in the pipeline for this specific role.</p>
              <button onClick={() => toast("Publishing to job boards...")} className="btn-ghost py-2 px-4 text-xs border border-white/10">Publish to Job Boards</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetail;
