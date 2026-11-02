import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, Wrench, Shield, RefreshCw, LogOut, UserX } from 'lucide-react';

interface RoleSwitcherBannerProps {
  onSwitchPortal?: (tab: 'landing' | 'customer' | 'technician' | 'admin') => void;
}

export const RoleSwitcherBanner: React.FC<RoleSwitcherBannerProps> = ({ onSwitchPortal }) => {
  const { currentUser, currentRole, switchDemoRole, logout, isSupabaseActive, adminEmailConfig, resetDemoData } = useApp();

  const handleSwitch = (role: 'customer' | 'technician' | 'admin') => {
    switchDemoRole(role);
    if (onSwitchPortal) {
      onSwitchPortal(role);
    }
  };

  const handleGuest = async () => {
    await logout();
    if (onSwitchPortal) {
      onSwitchPortal('landing');
    }
  };

  return (
    <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
            isSupabaseActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseActive ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            {isSupabaseActive ? 'Supabase Connected' : 'Role Portal Switcher'}
          </span>
          <span className="text-stone-400 hidden sm:inline">
            Admin Email: <code className="text-stone-300 font-mono">{adminEmailConfig}</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-400 hidden md:inline">Test Role Portal:</span>
          <div className="inline-flex rounded-md p-0.5 bg-stone-800 border border-stone-700">
            <button
              onClick={() => handleSwitch('customer')}
              title="Show Customer Portal only"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                currentUser && currentRole === 'customer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => handleSwitch('technician')}
              title="Show Technician Portal only"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                currentUser && currentRole === 'technician'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Technician</span>
            </button>

            <button
              onClick={() => handleSwitch('admin')}
              title="Show Admin Portal only"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                currentUser && currentRole === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              onClick={handleGuest}
              title="Show Public Guest / Logged-out landing"
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                !currentUser
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Guest</span>
            </button>
          </div>

          <button
            onClick={resetDemoData}
            title="Reset demo data to default initial state"
            className="flex items-center gap-1 px-2 py-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors ml-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden lg:inline text-[11px]">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
