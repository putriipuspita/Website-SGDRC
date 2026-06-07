'use client';
import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Download,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// Fungsi Menentukan Status Jadwal Timeline
const hitungStatus = (item) => {
  if (!item.mulai) return item.status || 'Akan Datang';

  // Mengambil Tanggal Hari Ini
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  // Mengambil Tanggal Mulai Kegiatan
  const tMulai = new Date(item.mulai);
  tMulai.setHours(0, 0, 0, 0);

  // Mengambil Tanggal Selesai Kegiatan
  const tSelesai = item.selesai ? new Date(item.selesai) : tMulai;
  tSelesai.setHours(23, 59, 59, 999);

  // Menentukan Status
  if (hariIni < tMulai) {
    return 'Akan Datang';
  } else if (hariIni >= tMulai && hariIni <= tSelesai) {
    return 'Sedang Berlangsung';
  } else {
    return 'Selesai';
  }
};

// Menampilkan Poster dan Timeline Kegiatan Perlombaan
export default function TampilanInformasi({ data }) {
  return (
    // Bagian Poster & Timeline
    <div className="grid grid-cols-1 lg:grid-cols-1 lg:landscape:grid-cols-12 gap-10 lg:gap-12 items-start">

      {/* Container Kolom Poster */}
      <div className="lg:col-span-1 lg:landscape:col-span-6">
        {/* Poster Tetep Terlihat Ketika Scrool */}
        <div className="sticky top-28 space-y-6">
          <div className="relative group">
            <div className="bg-white p-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-slate-100 overflow-hidden transform transition-all duration-700">
              <div className="relative rounded-xl overflow-hidden bg-slate-50">
                {/* Menampilkan Poster */}
                {data.poster ? (
                  <img
                    src={data.poster}
                    alt="Poster Lomba"
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  // Tampilan Jika Poster Belum Ada
                  <div className="aspect-[3/4] flex flex-col items-center justify-center text-slate-300 p-20">
                    <AlertCircle size={64} strokeWidth={1} className="mb-6" />
                    <p className="font-bold uppercase tracking-[0.3em] text-xs text-center">Poster Belum Tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Container Timeline */}
      <div className="lg:col-span-1 lg:landscape:col-span-6 space-y-8">
        {/* Container Judul Timeline */}
        <div className="flex flex-col items-center md:items-start space-y-1 ml-2">
          <div className="w-fit flex flex-col items-start">
            <h2 className="text-2xl font-black text-[#0B255D] uppercase tracking-tight text-center md:text-left">Timeline Kegiatan</h2>
            <div className="w-12 h-1 bg-[#16B9FF] rounded-full"></div>
          </div>
        </div>

        {/* Container Isi Timeline */}
        <div className="relative">
          {/* Garis Timeline  */}
          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-blue-100 via-blue-200 to-transparent"></div>

          {/* Container Kotak Timeline */}
          <div className="space-y-8 md:space-y-0 relative">
            {data.timeline && data.timeline.length > 0 ? (
              data.timeline.map((item, index) => {
                const apakahGenap = index % 2 === 0;
                const apakahPertama = index === 0;
                const apakahTerakhir = index === data.timeline.length - 1;
                const statusAktif = hitungStatus(item);

                return (
                  <div
                    key={index}
                    className={`relative pl-12 md:pl-0 flex w-full md:mb-0 ${apakahGenap ? 'md:flex-row-reverse' : ''} ${apakahPertama ? 'md:items-start' : apakahTerakhir ? 'md:items-end' : 'md:items-center'
                      } ${!apakahPertama ? 'md:-mt-4' : ''}`}
                  >

                    {/* Kotak Timeline */}
                    <div className="w-full md:flex-1">
                      <div className={`p-4 rounded-xl border-2 transition-all duration-500 ${statusAktif === 'Sedang Berlangsung'
                        ? 'bg-white border-[#16B9FF] shadow-[0_15px_40px_rgba(22,185,255,0.15)] md:scale-[1.05]'
                        : 'bg-white border-slate-100 shadow-md hover:shadow-lg hover:border-slate-200'
                        }`}>
                        <div className="flex flex-col">
                          {/* Status */}
                          <div className={`inline-flex items-center gap-1.5 text-[8.5px] font-black uppercase tracking-wide mb-1.5 ${statusAktif === 'Sedang Berlangsung' ? 'text-[#16B9FF]' :
                            statusAktif === 'Selesai' ? 'text-emerald-500' : 'text-slate-400'
                            }`}>
                            {statusAktif === 'Sedang Berlangsung' && <div className="w-1.5 h-1.5 bg-[#16B9FF] rounded-full animate-pulse"></div>}
                            {statusAktif}
                          </div>

                          {/* Judul */}
                          <h4 className={`text-[13px] font-bold leading-snug mb-1.5 ${statusAktif === 'Sedang Berlangsung' ? 'text-[#0B255D]' : 'text-slate-800'
                            }`}>
                            {item.label}
                          </h4>

                          {/* Tanggal */}
                          <div className="flex items-center gap-1.5">
                            <Calendar size={11} className="text-slate-400" />
                            <span className="text-[11px] font-medium text-slate-500 leading-snug">
                              {item.tanggal}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dot Indikator */}
                    <div className="absolute left-0 top-3 md:relative md:left-auto md:top-auto z-10 flex items-center justify-center w-8 h-8 md:w-12 md:h-12 my-0 md:mx-4">
                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl rotate-45 flex items-center justify-center transition-all ${statusAktif === 'Sedang Berlangsung'
                        ? 'bg-[#16B9FF] shadow-lg shadow-blue-400/50 scale-110'
                        : statusAktif === 'Selesai'
                          ? 'bg-emerald-500'
                          : 'bg-white border-2 border-slate-100'
                        }`}>

                        {/* Tampilan Icon */}
                        <div className="-rotate-45">
                          {/* Selesai */}
                          {statusAktif === 'Selesai' ? (
                            <>
                              <CheckCircle2 size={10} className="md:hidden text-white" />
                              <CheckCircle2 size={14} className="hidden md:block text-white" />
                            </>
                          ) :

                            // Sedang Belangsung
                            statusAktif === 'Sedang Berlangsung' ? (
                              <>
                                <Sparkles size={10} className="md:hidden text-white animate-pulse" />
                                <Sparkles size={14} className="hidden md:block text-white animate-pulse" />
                              </>
                            ) :

                              // Belum Tersedia
                              (
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                              )}
                        </div>
                      </div>
                    </div>

                    {/* Sisi Kosong Penyeimbang agar Dot Selalu di Tengah */}
                    <div className="hidden md:block md:flex-1"></div>
                  </div>
                );
              })
            ) : (

              // Tampilan Jika Jadwal Belum Tersedia
              <div className="py-20 text-center space-y-3">
                <Clock size={40} strokeWidth={1} className="mx-auto text-slate-200" />
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Jadwal Belum Tersedia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
