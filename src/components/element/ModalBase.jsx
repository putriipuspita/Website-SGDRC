'use client';
import React from 'react';
import { X } from 'lucide-react';

// Komponen Modal
const Modal = ({
  apakahTerbuka,
  setApakahTerbuka,
  judul,
  subJudul,
  icon: Icon,
  iconColor = "text-[#16B9FF]",
  lebar = "max-w-2xl",
  children,
  footer,
  centerTitle = false
}) => {
  if (!apakahTerbuka) return null;

  return (
    // Background Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-300">
      {/* Container Kotak */}
      <div className={`bg-white w-full ${lebar} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]`}>

        {/* Header Modal */}
        <div className={`bg-[#0B255D] py-4 px-6 flex justify-between items-center flex-shrink-0 ${centerTitle ? 'relative' : ''}`}>
          <div className={`${centerTitle ? 'w-full text-center flex flex-col items-center' : 'flex items-center gap-3.5'}`}>
            {/* Icon */}
            {!centerTitle && Icon && (
              <div className="flex-shrink-0">
                <Icon size={22} className={iconColor} />
              </div>
            )}

            {/* Judul dan Sub Judul */}
            <div className={centerTitle ? 'flex flex-col items-center' : 'flex flex-col'}>
              <h3 className="text-white font-black uppercase tracking-wide text-[14.5px]">
                {judul}
              </h3>

              {subJudul && (
                <p className={`text-white/70 text-[10.5px] font-bold uppercase tracking-wider ${centerTitle ? 'mt-0.5' : ''}`}>
                  {subJudul}
                </p>
              )}
            </div>
          </div>

          {/* Tombol Tutup */}
          <button
            onClick={() => setApakahTerbuka(false)}
            className={`text-white/50 hover:text-white transition-colors p-1 ${centerTitle ? 'absolute right-6 top-1/2 -translate-y-1/2' : ''}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-6 overflow-y-auto scrollbar-hide flex-1">
          {children}
        </div>

        {/* Footer Modal */}
        {footer && (
          <div className="py-4 px-6 bg-slate-50 flex items-center justify-center border-t border-slate-200 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
