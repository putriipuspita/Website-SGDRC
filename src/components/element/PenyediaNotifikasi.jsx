'use client';
import { Toaster } from "react-hot-toast";

export default function PenyediaNotifikasi() {
  return (
    <Toaster 
      position="top-right" 
      reverseOrder={false}
      toastOptions={{
        duration: 1800, // Durasi sedikit ditambah agar nyaman dibaca
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0,
        },
      }}
    >
      {(t) => (
        <div 
          style={{
            animation: t.visible 
              ? 'toast-enter 0.5s cubic-bezier(0.21, 1.02, 0.73, 1) forwards' 
              : 'toast-exit 0.5s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
          }}
          className={`
            bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] 
            border-l-[6px] ${t.type === 'error' ? 'border-rose-500' : 'border-emerald-500'} 
            p-4 flex items-center gap-3.5 min-w-[220px] max-w-[320px] pointer-events-auto
          `}
        >
          <style>{`
            @keyframes toast-enter {
              from { transform: translateX(120%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes toast-exit {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(120%); opacity: 0; }
            }
          `}</style>
          <div className={`w-10 h-10 ${t.type === 'error' ? 'bg-rose-100' : 'bg-emerald-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
            {t.type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            )}
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-widest mb-0.5">
              {t.type === 'error' ? 'Gagal' : 'Berhasil'}
            </h4>
            <p className="text-[10px] font-bold text-slate-500 leading-tight">
              {t.message}
            </p>
          </div>
        </div>
      )}
    </Toaster>
  );
}
