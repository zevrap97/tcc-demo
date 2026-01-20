import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ZmanimManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hebrew_date: '',
    daf_yomi: '',
    alot_hashachar: '',
    misheyakir: '',
    sunrise: '',
    shema_mga: '',
    shema_gra: '',
    tefilla_mga: '',
    tefilla_gra: '',
    chatzot: '',
    mincha_gedola: '',
    mincha_ketana: '',
    plag_hamincha: '',
    sunset: '',
    tzait_hakochavim: '',
  });

  const queryClient = useQueryClient();

  const { data: zmanim = [] } = useQuery({
    queryKey: ['allZmanim'],
    queryFn: () => base44.entities.Zmanim.list('-date', 30),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Zmanim.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allZmanim']);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Zmanim.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allZmanim']);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Zmanim.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allZmanim']);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      hebrew_date: '',
      daf_yomi: '',
      alot_hashachar: '',
      misheyakir: '',
      sunrise: '',
      shema_mga: '',
      shema_gra: '',
      tefilla_mga: '',
      tefilla_gra: '',
      chatzot: '',
      mincha_gedola: '',
      mincha_ketana: '',
      plag_hamincha: '',
      sunset: '',
      tzait_hakochavim: '',
    });
  };

  const handleEdit = (zman) => {
    setEditingId(zman.id);
    setFormData(zman);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Manage daily Jewish times and Daf Yomi</p>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Zmanim'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Hebrew Date</label>
                <Input
                  value={formData.hebrew_date}
                  onChange={(e) => setFormData({ ...formData, hebrew_date: e.target.value })}
                  placeholder="e.g., 15 Shevat 5786"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Daf Yomi</label>
                <Input
                  value={formData.daf_yomi}
                  onChange={(e) => setFormData({ ...formData, daf_yomi: e.target.value })}
                  placeholder="e.g., Bava Metzia 45"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Alot HaShachar</label>
                <Input
                  type="time"
                  value={formData.alot_hashachar}
                  onChange={(e) => setFormData({ ...formData, alot_hashachar: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Misheyakir</label>
                <Input
                  type="time"
                  value={formData.misheyakir}
                  onChange={(e) => setFormData({ ...formData, misheyakir: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Sunrise *</label>
                <Input
                  type="time"
                  value={formData.sunrise}
                  onChange={(e) => setFormData({ ...formData, sunrise: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Shema (MG"A)</label>
                <Input
                  type="time"
                  value={formData.shema_mga}
                  onChange={(e) => setFormData({ ...formData, shema_mga: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Shema (GR"A)</label>
                <Input
                  type="time"
                  value={formData.shema_gra}
                  onChange={(e) => setFormData({ ...formData, shema_gra: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Tefilla (MG"A)</label>
                <Input
                  type="time"
                  value={formData.tefilla_mga}
                  onChange={(e) => setFormData({ ...formData, tefilla_mga: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Tefilla (GR"A)</label>
                <Input
                  type="time"
                  value={formData.tefilla_gra}
                  onChange={(e) => setFormData({ ...formData, tefilla_gra: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Chatzot</label>
                <Input
                  type="time"
                  value={formData.chatzot}
                  onChange={(e) => setFormData({ ...formData, chatzot: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Mincha Gedola</label>
                <Input
                  type="time"
                  value={formData.mincha_gedola}
                  onChange={(e) => setFormData({ ...formData, mincha_gedola: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Mincha Ketana</label>
                <Input
                  type="time"
                  value={formData.mincha_ketana}
                  onChange={(e) => setFormData({ ...formData, mincha_ketana: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Plag HaMincha</label>
                <Input
                  type="time"
                  value={formData.plag_hamincha}
                  onChange={(e) => setFormData({ ...formData, plag_hamincha: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Sunset *</label>
                <Input
                  type="time"
                  value={formData.sunset}
                  onChange={(e) => setFormData({ ...formData, sunset: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Tzait HaKochavim</label>
                <Input
                  type="time"
                  value={formData.tzait_hakochavim}
                  onChange={(e) => setFormData({ ...formData, tzait_hakochavim: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {zmanim.map((zman) => (
          <motion.div
            key={zman.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-4 border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-slate-800">{zman.date}</p>
                  <span className="text-sm text-slate-500">{zman.hebrew_date}</span>
                </div>
                {zman.daf_yomi && (
                  <p className="text-sm text-slate-600 mt-1">Daf Yomi: {zman.daf_yomi}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>Sunrise: {zman.sunrise}</span>
                  <span>Sunset: {zman.sunset}</span>
                  {zman.shema_gra && <span>Shema: {zman.shema_gra}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(zman)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(zman.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}