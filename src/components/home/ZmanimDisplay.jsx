import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Sunrise } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const defaultZmanim = [
  { key: 'alot_hashachar', label: 'Alot HaShachar', icon: Sunrise },
  { key: 'sunrise', label: 'Sunrise', icon: Sun },
  { key: 'shema_gra', label: 'Sof Zman Shma', icon: Sun },
  { key: 'tefilla_gra', label: 'Sof Zman Tefilla', icon: Sun },
  { key: 'chatzot', label: 'Chatzot', icon: Sun },
  { key: 'mincha_gedola', label: 'Mincha Gedola', icon: Sun },
  { key: 'mincha_ketana', label: 'Mincha Ketana', icon: Sunset },
  { key: 'plag_hamincha', label: 'Plag HaMincha', icon: Sunset },
  { key: 'sunset', label: 'Sunset', icon: Sunset },
  { key: 'tzait_hakochavim', label: 'Tzait HaKochavim', icon: Moon },
];

const defaultDisplayZmanim = ['sunrise', 'shema_gra', 'sunset', 'tzait_hakochavim'];

export default function ZmanimDisplay({ selectedZmanim }) {
  const today = new Date().toISOString().split('T')[0];

  const { data: todayZmanim, isLoading: loading } = useQuery({
    queryKey: ['zmanim', today],
    queryFn: async () => {
      const result = await base44.entities.Zmanim.filter({ date: today });
      return result[0] || null;
    },
  });

  const displayZmanim = selectedZmanim?.length > 0 
    ? defaultZmanim.filter(z => selectedZmanim.includes(z.key))
    : defaultZmanim.filter(z => defaultDisplayZmanim.includes(z.key));

  return (
    <div className="space-y-3">
      {/* Hebrew Date & Daf Yomi */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-slate-700 font-medium">{todayZmanim?.hebrew_date || '...'}</p>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        {todayZmanim?.daf_yomi && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Daf Yomi</p>
            <p className="text-sm font-semibold text-slate-700">{todayZmanim.daf_yomi}</p>
          </div>
        )}
      </div>

      {/* Today's Times - 2x2 Grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Today's Times</h3>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 h-24 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {displayZmanim.map(({ key, label, icon: Icon }) => {
              const time = todayZmanim?.[key] || '--:--';
              return (
                <motion.div 
                  key={key}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-slate-100 shadow-sm"
                >
                  <Icon className="w-6 h-6 text-blue-600" />
                  <p className="text-xs text-slate-500 text-center">{label}</p>
                  <p className="font-bold text-lg text-slate-800">{time}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}