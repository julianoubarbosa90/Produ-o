
import React from 'react';
import type { TabID } from './types';

export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export const CubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

export const ArchiveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

export const FormulaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v4.5m0-4.5h4.5m-4.5 0H7.5m9 6.75l-1.5-1.5m0 0l-1.5 1.5m-1.5-1.5l1.5-1.5m1.5 1.5l1.5 1.5M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
);

export const TABS: { id: TabID; name: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'dashboard', name: 'Início', icon: HomeIcon },
  { id: 'production', name: 'Produção', icon: CubeIcon },
  { id: 'inventory', name: 'Estoque', icon: ArchiveIcon },
  { id: 'formulas', name: 'Fórmulas', icon: FormulaIcon },
];

export const INVENTORY_COLORS = [
    '#dc2626', // red-600
    '#ea580c', // orange-600
    '#facc15', // yellow-400
    '#4ade80', // green-400
    '#2563eb', // blue-600
    '#7c3aed', // violet-600
    '#db2777', // pink-600
    '#64748b', // slate-500
];
