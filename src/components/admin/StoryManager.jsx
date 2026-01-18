import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Eye, Upload, X, Calendar, Type, Link2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function StoryManager() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    slides: [],
    expires_at: '',
  });
  const [uploading, setUploading] = useState(false);
  const [addSlideType, setAddSlideType] = useState(null);
  const [textSlideInput, setTextSlideInput] = useState('');
  const [linkSlideInputs, setLinkSlideInputs] = useState({ url: '', text: '' });
  const queryClient = useQueryClient();

  const { data: stories = [] } = useQuery({
    queryKey: ['allStories'],
    queryFn: () => base44.entities.Story.list('-created_date'),
  });

  const createStoryMutation = useMutation({
    mutationFn: (storyData) => base44.entities.Story.create(storyData),
    onSuccess: () => {
      queryClient.invalidateQueries(['allStories']);
      setShowAddForm(false);
      setNewStory({ title: '', slides: [], expires_at: '' });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (id) => base44.entities.Story.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allStories']);
    },
  });

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const isVideo = file.type.startsWith('video/');
        return {
          type: isVideo ? 'video' : 'image',
          url: file_url,
          duration: isVideo ? 15 : 5
        };
      });

      const uploadedSlides = await Promise.all(uploadPromises);
      
      setNewStory({
        ...newStory,
        slides: [...newStory.slides, ...uploadedSlides],
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeSlide = (index) => {
    setNewStory({
      ...newStory,
      slides: newStory.slides.filter((_, i) => i !== index),
    });
  };

  const addTextSlide = () => {
    if (!textSlideInput.trim()) return;
    setNewStory({
      ...newStory,
      slides: [...newStory.slides, { type: 'text', text: textSlideInput, duration: 5 }],
    });
    setTextSlideInput('');
    setAddSlideType(null);
  };

  const addLinkSlide = () => {
    if (!linkSlideInputs.url.trim()) return;
    setNewStory({
      ...newStory,
      slides: [...newStory.slides, { 
        type: 'link', 
        link_url: linkSlideInputs.url,
        link_text: linkSlideInputs.text || linkSlideInputs.url,
        duration: 5 
      }],
    });
    setLinkSlideInputs({ url: '', text: '' });
    setAddSlideType(null);
  };

  const handleSubmit = () => {
    if (newStory.slides.length === 0) return;
    
    createStoryMutation.mutate({
      title: newStory.title || 'Untitled Story',
      slides: newStory.slides,
      is_active: true,
      expires_at: newStory.expires_at || null,
    });
  };

  return (
    <div className="space-y-4">
      {/* Add Story Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowAddForm(true)}
        className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create New Story
      </motion.button>

      {/* Add Story Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl border-2 border-blue-200 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">New Story</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <Input
              placeholder="Story Title (optional)"
              value={newStory.title}
              onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
            />

            <div className="space-y-2">
              <label className="text-sm text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Expires At (optional)
              </label>
              <Input
                type="datetime-local"
                value={newStory.expires_at}
                onChange={(e) => setNewStory({ ...newStory, expires_at: e.target.value })}
              />
            </div>

            {/* Slides Preview */}
            {newStory.slides.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {newStory.slides.map((slide, index) => (
                  <div key={index} className="relative aspect-[9/16] rounded-lg overflow-hidden bg-slate-100">
                    {slide.type === 'video' ? (
                      <video src={slide.url} className="w-full h-full object-cover" />
                    ) : slide.type === 'text' ? (
                      <div className="w-full h-full flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-purple-500">
                        <p className="text-white text-xs text-center line-clamp-6">{slide.text}</p>
                      </div>
                    ) : slide.type === 'link' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-green-500 to-teal-500">
                        <Link2 className="w-6 h-6 text-white mb-2" />
                        <p className="text-white text-xs text-center line-clamp-4">{slide.link_text}</p>
                      </div>
                    ) : (
                      <img src={slide.url || slide.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded capitalize">
                      {slide.type}
                    </div>
                    <button
                      onClick={() => removeSlide(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Slide Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Add Slide:</p>
              <div className="flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <div className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors">
                    {uploading ? (
                      <div className="text-slate-500 text-sm">Uploading...</div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Image/Video</p>
                      </>
                    )}
                  </div>
                </label>
                <button
                  onClick={() => setAddSlideType('text')}
                  className="flex-1 p-3 border-2 border-slate-300 rounded-lg hover:border-blue-400 transition-colors"
                >
                  <Type className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Text</p>
                </button>
                <button
                  onClick={() => setAddSlideType('link')}
                  className="flex-1 p-3 border-2 border-slate-300 rounded-lg hover:border-blue-400 transition-colors"
                >
                  <Link2 className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Link</p>
                </button>
              </div>
            </div>

            {/* Text Slide Input */}
            {addSlideType === 'text' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 border-2 border-blue-200 rounded-lg p-3"
              >
                <Textarea
                  placeholder="Enter text for slide..."
                  value={textSlideInput}
                  onChange={(e) => setTextSlideInput(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button onClick={addTextSlide} className="flex-1" disabled={!textSlideInput.trim()}>
                    Add Text Slide
                  </Button>
                  <Button onClick={() => setAddSlideType(null)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Link Slide Input */}
            {addSlideType === 'link' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 border-2 border-blue-200 rounded-lg p-3"
              >
                <Input
                  placeholder="Enter URL..."
                  value={linkSlideInputs.url}
                  onChange={(e) => setLinkSlideInputs({ ...linkSlideInputs, url: e.target.value })}
                />
                <Input
                  placeholder="Display text (optional)"
                  value={linkSlideInputs.text}
                  onChange={(e) => setLinkSlideInputs({ ...linkSlideInputs, text: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={addLinkSlide} className="flex-1" disabled={!linkSlideInputs.url.trim()}>
                    Add Link Slide
                  </Button>
                  <Button onClick={() => setAddSlideType(null)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={newStory.slides.length === 0}
                className="flex-1 bg-blue-600"
              >
                Create Story
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stories List */}
      <div className="space-y-3">
        {stories.map((story) => (
          <Card key={story.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{story.title || 'Untitled Story'}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-blue-600">
                      <Eye className="w-4 h-4" />
                      {story.view_count || 0} views
                    </span>
                    <span className="text-slate-500">
                      {story.slides?.length || 0} slides
                    </span>
                    {story.expires_at && (
                      <span className="text-slate-500">
                        Expires: {new Date(story.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      story.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {story.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteStoryMutation.mutate(story.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Slide Thumbnails */}
              {story.slides && story.slides.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {story.slides.map((slide, index) => (
                    <div key={index} className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-slate-100 relative">
                      {slide.type === 'video' ? (
                        <>
                          <video src={slide.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                              <div className="w-0 h-0 border-l-4 border-l-slate-700 border-t-3 border-b-3 border-t-transparent border-b-transparent ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : slide.type === 'text' ? (
                        <div className="w-full h-full flex items-center justify-center p-1 bg-gradient-to-br from-blue-500 to-purple-500">
                          <Type className="w-4 h-4 text-white" />
                        </div>
                      ) : slide.type === 'link' ? (
                        <div className="w-full h-full flex items-center justify-center p-1 bg-gradient-to-br from-green-500 to-teal-500">
                          <Link2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <img src={slide.url || slide.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}