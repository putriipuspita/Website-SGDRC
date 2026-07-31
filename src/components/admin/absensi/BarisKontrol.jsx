'use client';
import React from 'react';
import { Search, Camera, Filter, ChevronDown, FileSpreadsheet } from 'lucide-react';

const BarisKontrol = ({
  lombaPilihan,
  setLombaPilihan,
  daftarNamaLombaUnik,
  daftarAbsensi,
  kataKunciCari,
  setKataKunciCari,
  apakahScannerAktif,
  setApakahScannerAktif,
  sedangMemuat,
  tanganiEksporExcel
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      {/* Kontrol Utama Pilihan Lomba, Pencarian, Scanner, dan Ekspor Excel */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        
        {/* Filter Lomba Dropdown (Lebih Lebar) */}
        <div className="relative flex-1 min-w-[200px] w-full">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 pointer-events-none" size={14} />
          <select
            value={lombaPilihan}
            onChange={(e) => setLombaPilihan(e.target.value)}
            className="pl-9 pr-8 bg-white border-2 border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-[11.5px] font-bold text-slate-950 focus:border-[#16B9FF] w-full shadow-2xs h-10 truncate"
          >
            <option value="semua">SEMUA LOMBA ({daftarAbsensi.length})</option>
            {daftarNamaLombaUnik.map((lomba, idx) => {
              const jumlahLomba = daftarAbsensi.filter(i => i.namaLomba === lomba).length;
              return (
                <option key={idx} value={lomba}>
                  {lomba.toUpperCase()} ({jumlahLomba})
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-950 pointer-events-none" size={14} />
        </div>

        {/* Input Pencarian Peserta (Lebih Lebar) */}
        <div className="relative group flex-1 min-w-[180px] w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 group-focus-within:text-[#16B9FF] transition-colors pointer-events-none" size={14} />
          <input
            type="text"
            placeholder="Cari Peserta..."
            value={kataKunciCari}
            onChange={(e) => setKataKunciCari(e.target.value)}
            className="pl-9 pr-4 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[11.5px] font-bold text-slate-950 placeholder:text-slate-950 shadow-2xs w-full h-10"
          />
          {kataKunciCari && (
            <button
              onClick={() => setKataKunciCari('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Tombol Aksi Kanan (Scanner QR & Export Excel - Rapi & Pas di HP Maupun Laptop) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          {/* Tombol Scanner QR */}
          <button
            onClick={() => setApakahScannerAktif(!apakahScannerAktif)}
            className="flex items-center justify-center bg-[#0B255D] hover:bg-blue-900 text-white px-3 sm:px-4 rounded-xl text-[11px] sm:text-[11.5px] font-bold transition-all gap-1.5 shadow-md shadow-[#0B255D]/20 active:scale-95 whitespace-nowrap cursor-pointer h-10 w-full sm:w-auto"
          >
            <Camera size={14} className="shrink-0" />
            <span className="truncate">{apakahScannerAktif ? 'Tutup Scanner' : 'Scanner QR'}</span>
          </button>

          {/* Tombol Export Excel */}
          <button
            onClick={tanganiEksporExcel}
            className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 rounded-xl text-[11px] sm:text-[11.5px] font-bold transition-all gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 whitespace-nowrap cursor-pointer h-10 w-full sm:w-auto"
            title="Export ke Excel"
          >
            <FileSpreadsheet size={14} className="shrink-0" />
            <span className="truncate">Export Excel</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default BarisKontrol;
