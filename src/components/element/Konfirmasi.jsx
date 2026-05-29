'use client';
// Import React dan Icon
import React from 'react';
import { Trash2 } from 'lucide-react';

// Komponen Konfirmasi Hapus
const Konfirmasi = ({ apakahTerbuka, setApakahTerbuka, dataNama, onConfirm, tipe = "tim", judulCustom, pesanCustom, textTombol = "Ya, Hapus", iconCustom: CustomIcon }) => {
  if (!apakahTerbuka) return null;

  return (
    // Container Halaman Konfirmasi Hapus
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay Background*/}
      <div
        className="absolute inset-0 bg-slate-900/50 transition-opacity"
        onClick={() => setApakahTerbuka(false)}
      ></div>

      {/* Container Kotak */}
      <div className="w-full max-w-[340px] bg-white rounded-[28px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] border border-slate-200 relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden font-montserrat p-7 text-center">

        {/* Icon Hapus */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
          {CustomIcon ? (
            <CustomIcon size={28} className="text-red-500 relative z-10" />
          ) : (
            <Trash2 size={28} className="text-red-500 relative z-10" />
          )}
        </div>

        {/* Container Teks */}
        <div className="space-y-3 mb-8">
          {/* Judul */}
          <h3 className="text-[15.5px] font-black text-slate-800 uppercase tracking-wide">
            {judulCustom || "KONFIRMASI PENGHAPUSAN"}
          </h3>

          {/* Pesan */}
          {pesanCustom ? (
            pesanCustom
          ) : (
            <p className="text-[11.5px] font-medium text-slate-500 leading-[1.7] px-1">
              Apakah Anda Yakin Ingin Menghapus {tipe} <span className="font-bold text-red-600">"{dataNama}"</span>? Tindakan Ini Akan Menghapus Data Secara Permanent.
            </p>
          )}
        </div>

        {/* Container Tombol */}
        <div className="flex gap-3">
          {/* Tombol Batal */}
          <button
            onClick={() => setApakahTerbuka(false)}
            className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-[10.5px] font-bold transition-all uppercase tracking-wide border border-slate-300"
          >
            Batal
          </button>

          {/* Tombol Hapus */}
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10.5px] font-black transition-all shadow-lg shadow-red-500/20 uppercase tracking-wide active:scale-95"
          >
            {textTombol}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Konfirmasi;
