import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function MinyanManager() {
  const [editDialog, setEditDialog] = useState({ open: false, minyan: null });
  const queryClient = useQueryClient();

  const { data: minyans = [] } = useQuery({
    queryKey: ['allMinyans'],
    queryFn: () => base44.entities.Minyan.list('-created_date'),
  });

  const { data: synagogues = [] } = useQuery({
    queryKey: ['synagogues'],
    queryFn: () => base44.entities.Synagogue.list(),
  });

  const deleteMinyanMutation = useMutation({
    mutationFn: (id) => base44.entities.Minyan.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['allMinyans']),
  });

  const updateMinyanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Minyan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allMinyans']);
      setEditDialog({ open: false, minyan: null });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => base44.entities.Minyan.update(id, { is_active: isActive }),
    onSuccess: () => queryClient.invalidateQueries(['allMinyans']),
  });

  const handleSave = () => {
    updateMinyanMutation.mutate({ id: editDialog.minyan.id, data: editDialog.minyan });
  };

  const groupedMinyans = (minyans || []).reduce((acc, minyan) => {
    const name = minyan?.synagogue_name || 'Unknown';
    if (!acc[name]) acc[name] = [];
    acc[name].push(minyan);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupedMinyans).map(([synagogueName, synagogueMinyans]) => (
        <Card key={synagogueName}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-800 mb-3">{synagogueName}</h3>
            <div className="space-y-2">
              {synagogueMinyans.map((minyan) => (
                <div key={minyan.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800">{minyan.prayer_type}</span>
                      <span className="text-slate-600">{minyan.time}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {minyan.nusach}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-7">
                      {minyan.day_of_week?.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate({ id: minyan.id, isActive: !minyan.is_active })}
                      className={minyan.is_active ? 'text-green-600' : 'text-slate-400'}
                    >
                      {minyan.is_active ? 'Active' : 'Inactive'}
                    </Button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditDialog({ open: true, minyan })}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteMinyanMutation.mutate(minyan.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Minyan</DialogTitle>
          </DialogHeader>
          {editDialog.minyan && (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Prayer Type</label>
                <Select
                  value={editDialog.minyan.prayer_type}
                  onValueChange={(value) => setEditDialog({ ...editDialog, minyan: { ...editDialog.minyan, prayer_type: value } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shacharit">Shacharit</SelectItem>
                    <SelectItem value="Mincha">Mincha</SelectItem>
                    <SelectItem value="Maariv">Maariv</SelectItem>
                    <SelectItem value="Selichot">Selichot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Time</label>
                <Input
                  type="time"
                  value={editDialog.minyan.time}
                  onChange={(e) => setEditDialog({ ...editDialog, minyan: { ...editDialog.minyan, time: e.target.value } })}
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Nusach</label>
                <Select
                  value={editDialog.minyan.nusach}
                  onValueChange={(value) => setEditDialog({ ...editDialog, minyan: { ...editDialog.minyan, nusach: value } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ashkenaz">Ashkenaz</SelectItem>
                    <SelectItem value="Sefard">Sefard</SelectItem>
                    <SelectItem value="Edot HaMizrach">Edot HaMizrach</SelectItem>
                    <SelectItem value="Chabad">Chabad</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1 bg-blue-600">
                  Save Changes
                </Button>
                <Button onClick={() => setEditDialog({ open: false, minyan: null })} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}