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
  LogIn,
  CreditCard,
  Activity
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';

export default function Sidebar({ isOpen, onClose }) {
  const queryClient = useQueryClient();

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

  const { data: settings } = useQuery({
    queryKey: ['userSettings', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const s = await base44.entities.UserSettings.filter({ user_email: user.email });
      return s[0] || null;
    },
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (darkMode) => {
      if (!user) return;
      if (settings) {
        await base44.entities.UserSettings.update(settings.id, {
          ...settings,
          dark_mode: darkMode,
        });
      } else {
        await base44.entities.UserSettings.create({
          user_email: user.email,
          dark_mode: darkMode,
          display_zmanim: ['sunrise', 'sofZmanShma', 'sunset', 'tzait'],
          default_nusach: 'All',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userSettings']);
    },
  });

  const menuItems = [
    { icon: Settings, label: 'Settings', page: 'Settings', color: 'text-blue-600' },
    { icon: Heart, label: 'Favorites', page: 'Favorites', color: 'text-blue-600' },
    { icon: CreditCard, label: 'Submit Business', page: 'SubmitBusiness', color: 'text-blue-600' },
    { icon: Mail, label: 'Contact Us', page: 'Contact', color: 'text-blue-600' },
  ];

  const adminItems = user?.role === 'admin' ? [
    { icon: Activity, label: 'Admin Portal', page: 'Admin', color: 'text-purple-600' },
  ] : [];

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
              {/* Header with close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Blue Header with User Info */}
              <div className="bg-blue-600 pt-12 pb-6 px-6 text-center text-white">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                {user ? (
                  <>
                    <p className="font-semibold text-lg">{user.full_name || 'User'}</p>
                    <p className="text-sm text-blue-100 mt-1">{user.email}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-lg">Guest User</p>
                    <button
                      onClick={handleLogin}
                      className="text-sm text-blue-100 mt-2 underline hover:text-white"
                    >
                      Login / Register
                    </button>
                  </>
                )}
              </div>

              {/* Menu Items */}
              <nav className="flex-1 py-2">
                {adminItems.map(({ icon: Icon, label, page, color }) => (
                  <Link
                    key={page}
                    to={createPageUrl(page)}
                    onClick={onClose}
                    className="flex items-center gap-3 px-6 py-3 mb-2 bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-slate-700 font-medium">{label}</span>
                  </Link>
                ))}
                
                {menuItems.map(({ icon: Icon, label, page, color }) => (
                  <Link
                    key={page}
                    to={createPageUrl(page)}
                    onClick={onClose}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-slate-700">{label}</span>
                  </Link>
                ))}

                {/* Display Section */}
                <div className="mt-6 px-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Display
                  </p>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-700">Dark Mode</span>
                    <Switch
                      checked={settings?.dark_mode || false}
                      onCheckedChange={(checked) => updateSettingsMutation.mutate(checked)}
                      disabled={!user}
                    />
                  </div>
                </div>
              </nav>

              {/* Logout Button */}
              {user && (
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-700">Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}