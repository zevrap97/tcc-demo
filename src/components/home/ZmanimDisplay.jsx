import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Sunrise } from 'lucide-react';

const defaultZmanim = [
  { key: 'alot', label: 'Alot HaShachar', icon: Sunrise },
  { key: 'sunrise', label: 'Sunrise', icon: Sun },
  { key: 'sofZmanShma', label: 'Sof Zman Shma', icon: Sun },
  { key: 'sofZmanTefilla', label: 'Sof Zman Tefilla', icon: Sun },
  { key: 'chatzot', label: 'Chatzot', icon: Sun },
  { key: 'minchaGedola', label: 'Mincha Gedola', icon: Sun },
  { key: 'minchaKetana', label: 'Mincha Ketana', icon: Sunset },
  { key: 'plagHamincha', label: 'Plag HaMincha', icon: Sunset },
  { key: 'sunset', label: 'Sunset', icon: Sunset },
  { key: 'tzait', label: 'Tzait HaKochavim', icon: Moon },
];

const defaultDisplayZmanim = ['sunrise', 'sofZmanShma', 'sunset', 'tzait'];

export default function ZmanimDisplay({ selectedZmanim }) {
  const [zmanimTimes, setZmanimTimes] = useState({});
  const [hebrewDate, setHebrewDate] = useState('');
  const [dafYomi, setDafYomi] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZmanim = async () => {
      try {
        const lat = 41.8781;
        const lng = -87.6298;
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        const response = await fetch(
          `https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lng}&date=${dateStr}&tzid=America/Chicago`
        );
        const data = await response.json();

        const times = {
          alot: formatTime(data.times?.alotHaShachar),
          sunrise: formatTime(data.times?.sunrise),
          sofZmanShma: formatTime(data.times?.sofZmanShmaMGA),
          sofZmanTefilla: formatTime(data.times?.sofZmanTfillaMGA),
          chatzot: formatTime(data.times?.chatzot),
          minchaGedola: formatTime(data.times?.minchaGedola),
          minchaKetana: formatTime(data.times?.minchaKetana),
          plagHamincha: formatTime(data.times?.plagHaMincha),
          sunset: formatTime(data.times?.sunset),
          tzait: formatTime(data.times?.tzeit),
        };
        setZmanimTimes(times);

        const hebcalResponse = await fetch(
          `https://www.hebcal.com/converter?cfg=json&date=${dateStr}&g2h=1&strict=1`
        );
        const hebcalData = await hebcalResponse.json();
        setHebrewDate(hebcalData.hebrew || '');

        const dafResponse = await fetch(
          `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lng}&tzid=America/Chicago&M=on`
        );
        const dafData = await dafResponse.json();
        const dafItem = dafData.items?.find(item => item.category === 'dafyomi');
        setDafYomi(dafItem?.title?.replace('Daf Yomi: ', '') || 'Loading...');

      } catch (error) {
        console.log('Error fetching zmanim:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZmanim();
  }, []);

  const formatTime = (isoTime) => {
    if (!isoTime) return '--:--';
    const date = new Date(isoTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  const displayZmanim = selectedZmanim?.length > 0 
    ? defaultZmanim.filter(z => selectedZmanim.includes(z.key))
    : defaultZmanim.filter(z => defaultDisplayZmanim.includes(z.key));

  return (
    <div className="space-y-3">
      {/* Hebrew Date & Daf Yomi */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-slate-700 font-medium">{hebrewDate}</p>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        {dafYomi && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Daf Yomi</p>
            <p className="text-sm font-semibold text-slate-700">{dafYomi}</p>
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
              const time = zmanimTimes[key];
              return (
                <motion.div 
                  key={key}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-slate-100 shadow-sm"
                >
                  <Icon className="w-6 h-6 text-blue-600" />
                  <p className="text-xs text-slate-500 text-center">{label}</p>
                  <p className="font-bold text-lg text-slate-800">{time || '--:--'}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}