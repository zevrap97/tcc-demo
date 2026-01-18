import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Upload, X, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function NewsManager() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    image_url: '',
    priority: 0,
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: allNews = [] } = useQuery({
    queryKey: ['allNews'],
    queryFn: () => base44.entities.News.list('-priority'),
  });

  const createNewsMutation = useMutation({
    mutationFn: (newsData) => base44.entities.News.create(newsData),
    onSuccess: () => {
      queryClient.invalidateQueries(['allNews']);
      setShowAddForm(false);
      setNewNews({ title: '', content: '', image_url: '', priority: 0 });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.News.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allNews']);
      setEditingNews(null);
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id) => base44.entities.News.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allNews']);
    },
  });

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (editingNews) {
        setEditingNews({ ...editingNews, image_url: file_url });
      } else {
        setNewNews({ ...newNews, image_url: file_url });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!newNews.title || !newNews.content) return;
    
    createNewsMutation.mutate({
      ...newNews,
      is_active: true,
    });
  };

  const handleUpdate = () => {
    if (!editingNews.title || !editingNews.content) return;
    
    updateNewsMutation.mutate({
      id: editingNews.id,
      data: {
        title: editingNews.title,
        content: editingNews.content,
        image_url: editingNews.image_url,
        priority: editingNews.priority,
        is_active: editingNews.is_active,
      },
    });
  };

  const NewsForm = ({ news, setNews, onSubmit, onCancel, isEdit = false }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl border-2 border-blue-200 p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">{isEdit ? 'Edit News' : 'New News Item'}</h3>
        <button onClick={onCancel}>
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <Input
        placeholder="News Title"
        value={news.title}
        onChange={(e) => setNews({ ...news, title: e.target.value })}
      />

      <Textarea
        placeholder="News Content"
        value={news.content}
        onChange={(e) => setNews({ ...news, content: e.target.value })}
        rows={4}
      />

      <Input
        type="number"
        placeholder="Priority (higher shows first)"
        value={news.priority}
        onChange={(e) => setNews({ ...news, priority: parseInt(e.target.value) || 0 })}
      />

      {news.image_url && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-100">
          <img src={news.image_url} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => setNews({ ...news, image_url: '' })}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <label className="block">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="hidden"
        />
        <div className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors">
          {uploading ? (
            <div className="text-slate-500">Uploading...</div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Add Image</p>
            </>
          )}
        </div>
      </label>

      <div className="flex gap-2">
        <Button onClick={onSubmit} disabled={!news.title || !news.content} className="flex-1 bg-blue-600">
          {isEdit ? 'Update' : 'Create'} News
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowAddForm(true)}
        className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add News Item
      </motion.button>

      <AnimatePresence>
        {showAddForm && (
          <NewsForm
            news={newNews}
            setNews={setNewNews}
            onSubmit={handleSubmit}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingNews && (
          <NewsForm
            news={editingNews}
            setNews={setEditingNews}
            onSubmit={handleUpdate}
            onCancel={() => setEditingNews(null)}
            isEdit
          />
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {allNews.map((news) => (
          <Card key={news.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {news.image_url && (
                  <img src={news.image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{news.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{news.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          news.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {news.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-slate-500">Priority: {news.priority}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingNews(news)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteNewsMutation.mutate(news.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}