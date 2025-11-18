
import React, { useState } from 'react';
import { TABS } from '../constants';
import type { TabID } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabID;
  setActiveTab: (tab: TabID) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-950 text-gray-200">
      <aside className={`bg-neutral-900 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center h-20 p-4 border-b border-neutral-800 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="bg-rose-800 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7l8 4.5 8-4.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15.5V22" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 13.5l-4.5 2.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 13.5l4.5 2.5" />
                </svg>
            </div>
            {!isCollapsed && <h1 className="text-xl font-bold text-white ml-3 whitespace-nowrap">DB Manager</h1>}
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <ul>
            {TABS.map((tab) => (
              <li key={tab.id} className="relative group">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''} ${
                    activeTab === tab.id
                      ? 'bg-rose-800 text-white shadow-lg'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
                  aria-label={tab.name}
                >
                  <tab.icon className="w-6 h-6 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium ml-3">{tab.name}</span>}
                </button>
                {isCollapsed && (
                   <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-neutral-700 text-white text-sm rounded py-1 px-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
                      {tab.name}
                    </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="w-full flex items-center justify-center p-3 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-6 w-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            </svg>
          </button>
           {!isCollapsed && (
             <div className="mt-4 text-center text-neutral-500 text-xs">
                 <p>&copy; 2024. All rights reserved.</p>
             </div>
           )}
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;