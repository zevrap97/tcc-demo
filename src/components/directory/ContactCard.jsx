import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Globe, Share2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function ContactCard({ contact }) {
  const [expanded, setExpanded] = useState(false);

  const handleCall = () => {
    window.open(`tel:${contact.phone}`, '_self');
  };

  const handleWhatsApp = () => {
    if (contact.phone) {
      const phoneNumber = contact.phone.replace(/\D/g, '');
      window.open(`https://wa.me/1${phoneNumber}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (contact.email) {
      window.open(`mailto:${contact.email}`, '_self');
    }
  };

  const handleWebsite = () => {
    if (contact.website) {
      window.open(contact.website.startsWith('http') ? contact.website : `https://${contact.website}`, '_blank');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: contact.name,
      text: `${contact.name}\n${contact.phone}${contact.address ? `\n${contact.address}` : ''}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">{contact.name}</h3>
            {contact.profession && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                {contact.profession}
              </span>
            )}
            {contact.profession_category && (
              <span className="inline-block mt-1 ml-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                {contact.profession_category}
              </span>
            )}
          </div>
          {contact.is_verified && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 text-white rounded-xl text-sm font-medium"
          >
            <Phone className="w-4 h-4" />
            Call
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center py-2.5 px-3 bg-slate-100 text-slate-700 rounded-xl"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {contact.email && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmail}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 text-left">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-slate-700">{contact.email}</p>
                  </div>
                </motion.button>
              )}
              
              {contact.address && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm text-slate-700">{contact.address}</p>
                  </div>
                </div>
              )}
              
              {contact.website && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWebsite}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 text-left">
                    <p className="text-xs text-slate-500">Website</p>
                    <p className="text-sm text-slate-700 truncate">{contact.website}</p>
                  </div>
                </motion.button>
              )}
              
              {contact.phone && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1 text-left">
                    <p className="text-xs text-green-600">WhatsApp</p>
                    <p className="text-sm text-slate-700">{contact.phone}</p>
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}