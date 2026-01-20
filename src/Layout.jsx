import React, { useState } from 'react';
import BottomNav from './components/navigation/BottomNav';
import TopBar from './components/navigation/TopBar';
import Sidebar from './components/navigation/Sidebar';

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pages that should hide navigation
  const fullScreenPages = ['SynagogueDetail', 'Settings', 'Contact', 'SubmitBusiness'];
  const hideNav = fullScreenPages.includes(currentPageName);

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --color-primary: #2563eb;
          --color-primary-dark: #1e3a5f;
          --color-secondary: #0ea5e9;
        }
        
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {!hideNav && <TopBar onMenuClick={() => setSidebarOpen(true)} />}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`${!hideNav ? 'pt-14 pb-20' : ''}`}>
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}