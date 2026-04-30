import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Settings, Users, MessageSquare, Clock, Code, X, UserPlus, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      toast.error("Failed to load project data");
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id, navigate]);

  const handleBuildRun = async () => {
    if (isBuilding) return;
    setIsBuilding(true);
    toast.info("Initializing build sequence...");
    
    // Simulate build time
    setTimeout(async () => {
      try {
        await api.post(`/projects/${id}/activities`, {
          action: 'compiled production build',
          target: 'v1.0.4-rc',
          user_name: 'System Automation'
        });
        toast.success("Build completed successfully");
        fetchProject();
      } catch (err) {
        toast.error("Build logging failed");
      } finally {
        setIsBuilding(false);
      }
    }, 2500);
  };

  const openTeamModal = async () => {
    try {
      const res = await api.get('/performance/users');
      setAllUsers(res.data);
      setIsTeamModalOpen(true);
    } catch (e) {
      toast.error("Failed to load team members");
    }
  };

  const assignMember = async (userId) => {
    try {
      await api.post(`/projects/${id}/members?user_id=${userId}`);
      toast.success("Operative assigned to project");
      fetchProject();
    } catch (e) {
      toast.error("Failed to assign operative");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-8 pb-10">
      {/* Top Nav */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-6">
        <button 
          onClick={() => navigate('/projects')}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-semibold text-white tracking-tight">{project.name}</h1>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-zinc-500">{project.project_type || 'Game'} · {project.engine || 'Custom Engine'}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => window.open("https://github.com/interactiveelyndor-pixel/Soft", "_blank")} className="btn-ghost py-2.5 px-4 text-xs font-semibold">
            <Code size={14} /> Repository
          </button>
          <button onClick={handleBuildRun} disabled={isBuilding} className="btn-primary py-2.5 px-5 text-xs font-semibold">
            {isBuilding ? <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Play size={14} className="fill-current" />} 
            {isBuilding ? 'Compiling...' : 'Build Run'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="xl:col-span-2 space-y-6">
          {/* Progress Overview */}
          <div className="card p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />
            <h2 className="text-sm font-heading font-semibold text-white mb-6">Production Status</h2>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[2.5rem] font-heading font-semibold text-white leading-none mb-2">{project.progress}%</p>
                <p className="text-xs text-zinc-400">Overall Completion</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white mb-1">Alpha Milestone</p>
                <p className="text-xs text-zinc-500">Due in 14 days</p>
              </div>
            </div>
            <div className="h-3 bg-[#0a0a0c] rounded-full overflow-hidden border border-white/[0.05]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary/80 to-accent rounded-full"
              />
            </div>
          </div>

          {/* Activity Mock */}
          <div className="card p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-heading font-semibold text-white">Recent Commits & Activity</h2>
              <button className="text-xs text-zinc-500 hover:text-accent transition-colors">View All</button>
            </div>
            <div className="space-y-5">
              {project.activities && project.activities.length > 0 ? (
                project.activities.slice().reverse().map((activity, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-zinc-500 flex-shrink-0 group-hover:text-accent group-hover:border-accent/20 transition-all">
                      <Settings size={14} />
                    </div>
                    <div className="flex-1 min-w-0 border-b border-white/[0.04] pb-5">
                      <p className="text-sm text-zinc-300">
                        <span className="font-medium text-white">{activity.user_name}</span> {activity.action} <span className="text-accent">{activity.target}</span>
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 py-4 text-center">No recent activity logged.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          {/* Team */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-zinc-500" />
                <h2 className="text-sm font-heading font-semibold text-white">Assigned Team</h2>
              </div>
              <span className="badge-muted">{project.members?.length || 0} Members</span>
            </div>
            <div className="space-y-3">
              {project.members && project.members.length > 0 ? project.members.map((member, i) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{member.name}</p>
                    <p className="text-[10px] text-zinc-500">{member.department || 'Operative'}</p>
                  </div>
                  <button onClick={() => window.location.href = `mailto:${member.email}`} className="ml-auto p-2 text-zinc-500 hover:text-white transition-colors">
                    <MessageSquare size={14} />
                  </button>
                </div>
              )) : (
                <p className="text-xs text-zinc-500 text-center py-4">No operatives assigned yet.</p>
              )}
            </div>
            <button onClick={openTeamModal} className="btn-ghost w-full mt-4 py-2.5 text-xs">Manage Team</button>
          </div>
        </div>
      </div>

      {/* Team Modal */}
      <AnimatePresence>
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="px-8 py-6 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-heading font-semibold text-white">Assign Operatives</h2>
                <button onClick={() => setIsTeamModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-3">
                {allUsers.map(u => {
                  const isAssigned = project.members?.some(m => m.id === u.id);
                  return (
                    <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                      <div>
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-zinc-500">{u.department || 'Operative'}</p>
                      </div>
                      {isAssigned ? (
                        <span className="badge-green"><Check size={12} /> Assigned</span>
                      ) : (
                        <button onClick={() => assignMember(u.id)} className="btn-ghost py-1.5 px-3 text-xs">
                          <UserPlus size={14} /> Assign
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectWorkspace;
