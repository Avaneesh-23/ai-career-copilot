import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, PlusCircle, Clock, LogOut, ChevronLeft, ChevronRight, Sparkles, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analysis', label: 'New Analysis', icon: PlusCircle },
  { to: '/history', label: 'History', icon: Clock },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <Sparkles className="w-7 h-7 text-primary flex-shrink-0" />
        {!collapsed && <span>Career Copilot</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-2">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center flex-shrink-0 border-2 border-black">
              <User className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm text-textMuted font-mono truncate">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
