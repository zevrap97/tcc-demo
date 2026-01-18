import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Settings, 
  Heart, 
  Mail, 
  Plus, 
  LogOut,
  LogIn
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Sidebar({ isOpen, onClose }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const menuItems = [
    { icon: Settings, label: 'Settings', page: 'Settings' },
    { icon: Heart, label: 'Favorites', page: 'Favorites' },
    { icon: Mail, label: 'Contact Us', page: 'Contact' },
    { icon: Plus, label: 'Submit Business', page: 'SubmitBusiness' },
  ];

  const handleLogout = () => {
    base44.auth.logout();
    onClose();
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    {user ? (
                      <>
                        <p className="font-semibold text-slate-800">{user.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </>
                    ) : (
                      <p className="font-medium text-slate-600">Guest</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <nav className="flex-1 py-4">
                {menuItems.map(({ icon: Icon, label, page }) => (
                  <Link
                    key={page}
                    to={createPageUrl(page)}
                    onClick={onClose}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">{label}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-100">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-700">Log Out</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <LogIn className="w-5 h-5 text-white" />
                    <span className="font-medium text-white">Log In</span>
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}