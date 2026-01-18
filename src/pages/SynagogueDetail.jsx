import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  User, 
  Clock, 
  Navigation,
  DollarSign,
  ExternalLink
} from 'lucide-react';

export default function SynagogueDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const synagogueId = urlParams.get('id');

  const { data: synagogue, isLoading } = useQuery({
    queryKey: ['synagogue', synagogueId],
    queryFn: async () => {
      const synagogues = await base44.entities.Synagogue.filter({ id: synagogueId });
      return synagogues[0] || null;
    },
    enabled: !!synagogueId,
  });

  const { data: minyans = [] } = useQuery({
    queryKey: ['synagogueMinyans', synagogueId],
    queryFn: () => base44.entities.Minyan.filter({ synagogue_id: synagogueId, is_active: true }),
    enabled: !!synagogueId,
  });

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const openGoogleMaps = () => {
    if (synagogue?.address) {
      const address = encodeURIComponent(synagogue.address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
    }
  };

  // Group minyans by day
  const minyansByDay = minyans.reduce((acc, minyan) => {
    (minyan.day_of_week || []).forEach(day => {
      if (!acc[day]) acc[day] = [];
      acc[day].push(minyan);
    });
    return acc;
  }, {});

  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbat'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!synagogue) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-500">Synagogue not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-sky-500 text-white pt-12 pb-6 px-4">
        <Link
          to={createPageUrl('Synagogues')}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <h1 className="text-2xl font-bold">{synagogue.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-sm">
            {synagogue.nusach}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-800 mb-4">Information</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">{synagogue.address}</p>
              </div>
            </div>
            
            {synagogue.rabbi && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <p className="text-sm text-slate-600">Rabbi {synagogue.rabbi}</p>
              </div>
            )}

            {synagogue.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <a href={`tel:${synagogue.phone}`} className="text-sm text-blue-600">
                  {synagogue.phone}
                </a>
              </div>
            )}

            {synagogue.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <a 
                  href={synagogue.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 flex items-center gap-1"
                >
                  Visit Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {synagogue.description && (
            <p className="mt-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
              {synagogue.description}
            </p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={openGoogleMaps}
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 text-white font-medium"
          >
            <Navigation className="w-5 h-5" />
            Navigate
          </motion.button>

          {synagogue.donation_url && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(synagogue.donation_url, '_blank')}
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-medium"
            >
              <DollarSign className="w-5 h-5" />
              Donate
            </motion.button>
          )}
        </div>

        {/* Prayer Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-800">Prayer Schedule</h2>
          </div>

          {Object.keys(minyansByDay).length === 0 ? (
            <p className="text-sm text-slate-500">No schedule available</p>
          ) : (
            <div className="space-y-4">
              {dayOrder.map(day => {
                if (!minyansByDay[day]) return null;
                return (
                  <div key={day}>
                    <p className="text-sm font-medium text-slate-700 mb-2">{day}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {minyansByDay[day]
                        .sort((a, b) => {
                          const [aH, aM] = a.time.split(':').map(Number);
                          const [bH, bM] = b.time.split(':').map(Number);
                          return (aH * 60 + aM) - (bH * 60 + bM);
                        })
                        .map((minyan, idx) => (
                          <div 
                            key={idx}
                            className="bg-slate-50 rounded-lg p-2 text-center"
                          >
                            <p className="text-xs text-slate-500">{minyan.prayer_type}</p>
                            <p className="text-sm font-medium text-slate-800">
                              {formatTime(minyan.time)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}