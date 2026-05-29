'use client';
import { Suspense } from 'react';
import DashboardPeserta from '@/components/peserta/Dashboard';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-montserrat">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 border-4 border-[#16B9FF] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-normal text-[10px]">Memuat Dashboard...</p>
        </div>
      </div>
    }>
      <DashboardPeserta />
    </Suspense>
  );
}
