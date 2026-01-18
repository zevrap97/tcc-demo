import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Globe, Share2 } from 'lucide-react';

export default function ContactCard({ contact }) {
  const handleCall = () => {
    window.open(`tel:${contact.phone}`, '_self');
  };

  const handleEmail = () => {
    if (contact.email) {
      window.open(`mailto:${contact.email}`, '_self');
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800">{contact.name}</h3>
          {contact.profession && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
              {contact.profession}
            </span>
          )}
          
          <div className="mt-3 space-y-1.5">
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.address && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="truncate">{contact.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCall}
            className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
          >
            <Phone className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {contact.description && (
        <p className="mt-3 text-sm text-slate-500 line-clamp-2">{contact.description}</p>
      )}
    </motion.div>
  );
}