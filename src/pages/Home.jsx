import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ZmanimDisplay from '@/components/home/ZmanimDisplay';
import { UtensilsCrossed, Clock, Building2, BookUser, ChevronRight } from 'lucide-react';

const quickLinks = [
  { icon: UtensilsCrossed, label: 'Restaurants', page: 'Restaurants', color: 'from-orange-400 to-red-500' },
  { icon: Clock, label: 'Minyan Times', page: 'Minyan', color: 'from-blue-400 to-indigo-500' },
  { icon: Building2, label: 'Synagogues', page: 'Synagogues', color: 'from-purple-400 to-pink-500' },
  { icon: BookUser, label: 'Directory', page: 'Directory', color: 'from-green-400 to-teal-500' },
];

export default function Home() {
  const { data: userSettings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const settings = await base44.entities.UserSettings.filter({ user_email: user.email });
          return settings[0] || null;
        }
        return null;
      } catch {
        return null;
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-slate-500 text-sm">Welcome to</p>
          <h1 className="text-2xl font-bold text-slate-800">Chicago Jewish Community</h1>
        </motion.div>

        {/* Zmanim Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ZmanimDisplay selectedZmanim={userSettings?.display_zmanim} />
        </motion.div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ icon: Icon, label, page, color }, index) => (
              <motion.div
                key={page}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link
                  to={createPageUrl(page)}
                  className="block"
                >
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-lg`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <p className="font-semibold">{label}</p>
                    <div className="flex items-center gap-1 mt-1 text-white/80 text-xs">
                      <span>Explore</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Community Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Community Info</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg">🕯️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Shabbat Candle Lighting</p>
                <p className="text-xs text-slate-500">Check zmanim above</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-lg">📖</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Torah Study</p>
                <p className="text-xs text-slate-500">Find minyanim with Daf Yomi</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}