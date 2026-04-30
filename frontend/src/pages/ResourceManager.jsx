import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, ChevronRight, Users, AlertCircle, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ResourceManager = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    title: '',
    department: 'Dev',
    slots_required: 1,
    is_urgent: false
  });

  const fetchRoles = async () => {
    try {
      const response = await api.get('/resources/');
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/resources/', newRole);
      setIsModalOpen(false);
      setNewRole({ title: '', department: 'Dev', slots_required: 1, is_urgent: false });
      navigate(`/resources/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to define role');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this position?')) return;
    try {
      await api.delete(`/resources/${id}`);
      fetchRoles();
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const unfilledCount = roles.filter(r => r.slots_filled < r.slots_required).length;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="label mb-1.5">Human Resources</p>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Resource Manager</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs"
        >
          <Plus size={15} />
          Define New Role
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Roles list */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-heading font-semibold text-white">Active Roles</h2>
            <span className="label">{unfilledCount} unfilled</span>
          </div>
          {roles.map((role, i) => {
            const open = role.slots_required - role.slots_filled;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => navigate(`/resources/${role.id}`)}
                className="card card-hover p-5 flex items-center gap-5 cursor-pointer group"
              >
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/15 text-accent flex-shrink-0">
                  <Briefcase size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-medium text-white group-hover:text-accent transition-colors truncate">{role.title}</h3>
                    {role.is_urgent && open > 0 && (
                      <span className="badge-red py-0.5 flex-shrink-0"><AlertCircle size={11} />Urgent</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">Department: {role.department}</p>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-4">
                  <div>
                    <p className="label mb-1">Filled / Total</p>
                    <p className="text-sm font-mono font-semibold text-white">
                      {role.slots_filled}
                      <span className="text-zinc-600"> / </span>
                      <span className={open > 0 ? 'text-red-400' : 'text-emerald-400'}>{role.slots_required}</span>
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(role.id, e)}
                    className="p-2 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                  <ChevronRight size={16} className="text-zinc-700 group-hover:text-accent transition-colors flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Hiring Pipeline */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-heading font-semibold text-white">Hiring Pipeline</h2>
            <span className="badge-green"><Users size={11} />{roles.flatMap(r => r.applicants || []).length} active</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto min-h-[300px]">
            {roles.flatMap(r => (r.applicants || []).map(a => ({...a, roleTitle: r.title})))
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((p, i) => (
              <div key={p.id} onClick={() => navigate(`/resources/${p.role_id}`)} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors cursor-pointer group">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{p.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{p.roleTitle}</p>
                </div>
                <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md whitespace-nowrap">{p.stage}</span>
              </div>
            ))}
            {roles.flatMap(r => r.applicants || []).length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <Users size={24} className="text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500">Pipeline is empty</p>
              </div>
            )}
          </div>
          <button onClick={() => toast("Full ATS system coming in v2.0")} className="btn-ghost w-full mt-5 text-xs py-3 mt-auto">View All Applications</button>
        </div>
      </div>

      {/* Define Role Modal */}
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
                <h2 className="text-xl font-heading font-semibold text-white">Define New Position</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Role Title</label>
                    <input
                      type="text"
                      required
                      value={newRole.title}
                      onChange={e => setNewRole({...newRole, title: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                      placeholder="e.g. Senior Gameplay Programmer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Department</label>
                      <select 
                        value={newRole.department}
                        onChange={e => setNewRole({...newRole, department: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 transition-all appearance-none"
                      >
                        <option value="Dev">Development</option>
                        <option value="Art">Art & Animation</option>
                        <option value="Design">Game Design</option>
                        <option value="QA">Quality Assurance</option>
                        <option value="Ops">Operations</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Total Slots</label>
                      <input
                        type="number"
                        min="1"
                        value={newRole.slots_required}
                        onChange={e => setNewRole({...newRole, slots_required: parseInt(e.target.value)})}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary/40 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-1">
                    <input
                      type="checkbox"
                      id="urgent"
                      checked={newRole.is_urgent}
                      onChange={e => setNewRole({...newRole, is_urgent: e.target.checked})}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20"
                    />
                    <label htmlFor="urgent" className="text-xs text-zinc-400 cursor-pointer">Mark as high priority / urgent hiring</label>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="btn-primary w-full py-3.5 font-semibold">
                    Authorize Hiring Start
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

export default ResourceManager;
