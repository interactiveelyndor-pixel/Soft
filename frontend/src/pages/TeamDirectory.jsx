import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UsersRound, Search, Mail, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const TeamDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/performance/users');
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch team", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    (u.department && u.department.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="label mb-1.5">Studio Roster</p>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight">Team Directory</h1>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search operatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="card p-6 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl text-primary font-bold mb-4">
              {user.avatar_initials || user.name.charAt(0)}
            </div>
            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-primary transition-colors">{user.name}</h3>
            <p className="text-xs text-zinc-400 mb-3">{user.department || 'Operative'} · {user.role.replace('_', ' ')}</p>
            
            {['core_team', 'admin'].includes(user.role) && (
              <span className="badge-green mb-4"><ShieldCheck size={11}/> Core Access</span>
            )}
            
            <a href={`mailto:${user.email}`} className="btn-ghost w-full py-2.5 text-xs mt-auto">
              <Mail size={14} /> Contact
            </a>
          </motion.div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center text-zinc-500">
            <UsersRound size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No operatives found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDirectory;
