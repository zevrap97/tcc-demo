import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Building2 } from 'lucide-react';
import MinyanContent from '@/components/daven/MinyanContent.jsx';
import SynagoguesContent from '@/components/daven/SynagoguesContent.jsx';

export default function Daven() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Daven</h1>
        
        <Tabs defaultValue="minyan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="minyan" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Minyan Times
            </TabsTrigger>
            <TabsTrigger value="shuls" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Synagogues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="minyan" className="mt-0">
            <MinyanContent />
          </TabsContent>

          <TabsContent value="shuls" className="mt-0">
            <SynagoguesContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}