import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Check,
  Loader2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const zmanimOptions = [
  { key: 'alot', label: 'Alot HaShachar' },
  { key: 'sunrise', label: 'Sunrise' },
  { key: 'sofZmanShma', label: 'Sof Zman Shma' },
  { key: 'sofZmanTefilla', label: 'Sof Zman Tefilla' },
  { key: 'chatzot', label: 'Chatzot' },
  { key: 'minchaGedola', label: 'Mincha Gedola' },
  { key: 'minchaKetana', label: 'Mincha Ketana' },
  { key: 'plagHamincha', label: 'Plag HaMincha' },
  { key: 'sunset', label: 'Sunset' },
  { key: 'tzait', label: 'Tzait HaKochavim' },
];

const nusachOptions = ['All', 'Ashkenaz', 'Sefard', 'Edot HaMizrach', 'Chabad'];

export default function Settings() {
  const [settings, setSettings] = useState({
    dark_mode: false,
    display_zmanim: zmanimOptions.map(z => z.key),
    default_nusach: 'All',
  });
  const [saved, setSaved] = useState(false);

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

  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ['userSettings', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const settings = await base44.entities.UserSettings.filter({ user_email: user.email });
      return settings[0] || null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings({
        dark_mode: existingSettings.dark_mode || false,
        display_zmanim: existingSettings.display_zmanim || ['sunrise', 'sofZmanShma', 'sunset', 'tzait'],
        default_nusach: existingSettings.default_nusach || 'All',
      });
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      if (existingSettings) {
        await base44.entities.UserSettings.update(existingSettings.id, {
          ...settings,
          user_email: user.email,
        });
      } else {
        await base44.entities.UserSettings.create({
          ...settings,
          user_email: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userSettings']);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const toggleZman = (key) => {
    setSettings(prev => {
      const currentZmanim = prev.display_zmanim || [];
      if (currentZmanim.includes(key)) {
        return { ...prev, display_zmanim: currentZmanim.filter(z => z !== key) };
      } else {
        return { ...prev, display_zmanim: [...currentZmanim, key] };
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <Link
          to={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Please log in to access settings</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 pt-12 pb-4 px-4">
        <Link
          to={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Dark Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.dark_mode ? (
                <Moon className="w-5 h-5 text-slate-600" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium text-slate-800">Dark Mode</p>
                <p className="text-sm text-slate-500">Toggle dark theme</p>
              </div>
            </div>
            <Switch
              checked={settings.dark_mode}
              onCheckedChange={(checked) => setSettings({ ...settings, dark_mode: checked })}
            />
          </div>
        </motion.div>

        {/* Zmanim Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-800 mb-4">Display Halachic Times</h2>
          <div className="space-y-2">
            {zmanimOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleZman(key)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                  settings.display_zmanim?.includes(key)
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-sm font-medium">{label}</span>
                {settings.display_zmanim?.includes(key) && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Default Nusach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-800 mb-4">Default Nusach</h2>
          <div className="flex flex-wrap gap-2">
            {nusachOptions.map((nusach) => (
              <button
                key={nusach}
                onClick={() => setSettings({ ...settings, default_nusach: nusach })}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  settings.default_nusach === nusach
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {nusach}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </motion.button>
      </div>
    </div>
  );
}