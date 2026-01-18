import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Pencil, Trash2, Plus, X, Building2, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function BusinessManager() {
  const [editDialog, setEditDialog] = useState({ open: false, type: null, item: null });
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date'),
  });

  const { data: synagogues = [] } = useQuery({
    queryKey: ['synagogues'],
    queryFn: () => base44.entities.Synagogue.list('-created_date'),
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: (id) => base44.entities.Restaurant.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['restaurants']),
  });

  const deleteSynagogueMutation = useMutation({
    mutationFn: (id) => base44.entities.Synagogue.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['synagogues']),
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Restaurant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['restaurants']);
      setEditDialog({ open: false, type: null, item: null });
    },
  });

  const updateSynagogueMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Synagogue.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['synagogues']);
      setEditDialog({ open: false, type: null, item: null });
    },
  });

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSynagogues = synagogues.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (editDialog.type === 'restaurant') {
      updateRestaurantMutation.mutate({ id: editDialog.item.id, data: editDialog.item });
    } else {
      updateSynagogueMutation.mutate({ id: editDialog.item.id, data: editDialog.item });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or address..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      
      <Tabs defaultValue="restaurants">
        <TabsList className="w-full">
          <TabsTrigger value="restaurants" className="flex-1">
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="synagogues" className="flex-1">
            <Building2 className="w-4 h-4 mr-2" />
            Synagogues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants" className="space-y-3 mt-4">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{restaurant.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{restaurant.address}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {restaurant.type}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {restaurant.kashrut_certification}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditDialog({ open: true, type: 'restaurant', item: restaurant })}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteRestaurantMutation.mutate(restaurant.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="synagogues" className="space-y-3 mt-4">
          {filteredSynagogues.map((synagogue) => (
            <Card key={synagogue.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{synagogue.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{synagogue.address}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {synagogue.nusach}
                      </span>
                      {synagogue.rabbi && (
                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                          Rabbi {synagogue.rabbi}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditDialog({ open: true, type: 'synagogue', item: synagogue })}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteSynagogueMutation.mutate(synagogue.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editDialog.type === 'restaurant' ? 'Restaurant' : 'Synagogue'}</DialogTitle>
          </DialogHeader>
          {editDialog.item && (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Name</label>
                <Input
                  value={editDialog.item.name}
                  onChange={(e) => setEditDialog({ ...editDialog, item: { ...editDialog.item, name: e.target.value } })}
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Address</label>
                <Input
                  value={editDialog.item.address || ''}
                  onChange={(e) => setEditDialog({ ...editDialog, item: { ...editDialog.item, address: e.target.value } })}
                />
              </div>
              {editDialog.type === 'restaurant' ? (
                <>
                  <div>
                    <label className="text-sm text-slate-600">Type</label>
                    <Select
                      value={editDialog.item.type}
                      onValueChange={(value) => setEditDialog({ ...editDialog, item: { ...editDialog.item, type: value } })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meat">Meat</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="pareve">Pareve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Kashrut Certification</label>
                    <Input
                      value={editDialog.item.kashrut_certification || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, item: { ...editDialog.item, kashrut_certification: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Phone</label>
                    <Input
                      value={editDialog.item.phone || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, item: { ...editDialog.item, phone: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Website</label>
                    <Input
                      value={editDialog.item.website || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, item: { ...editDialog.item, website: e.target.value } })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-slate-600">Nusach</label>
                    <Select
                      value={editDialog.item.nusach}
                      onValueChange={(value) => setEditDialog({ ...editDialog, item: { ...editDialog.item, nusach: value } })}
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
                  <div>
                    <label className="text-sm text-slate-600">Rabbi</label>
                    <Input
                      value={editDialog.item.rabbi || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, item: { ...editDialog.item, rabbi: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Phone</label>
                    <Input
                      value={editDialog.item.phone || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, item: { ...editDialog.item, phone: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Website</label>
                    <Input
                      value={editDialog.item.website || ''}
                      onChange={(e) => setEditDialog({ ...editDialog, item: { ...editDialog.item, website: e.target.value } })}
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1 bg-blue-600">
                  Save Changes
                </Button>
                <Button onClick={() => setEditDialog({ open: false, type: null, item: null })} variant="outline" className="flex-1">
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