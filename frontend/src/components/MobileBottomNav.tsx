import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Layers,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const MobileBottomNav: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
      isActive ? 'text-maroon-700 font-black' : 'text-slate-500 hover:text-slate-900 font-semibold'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE5E5] px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavLink to="/" end className={navClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-maroon-50' : ''}`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Home</span>
            </>
          )}
        </NavLink>

        <NavLink to="/tools" className={navClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-maroon-50' : ''}`}>
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Tools</span>
            </>
          )}
        </NavLink>

        <NavLink to="/conversions" className={navClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-maroon-50' : ''}`}>
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Convert</span>
            </>
          )}
        </NavLink>

        <NavLink to="/ai/chat" className={navClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-maroon-50' : ''}`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">AI Lab</span>
            </>
          )}
        </NavLink>

        <NavLink to="/profile" className={navClass}>
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-maroon-50' : ''}`}>
                {isAuthenticated && user?.avatar ? (
                  <img src={user.avatar} alt="User" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <span className="text-[10px] mt-0.5">Profile</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};

