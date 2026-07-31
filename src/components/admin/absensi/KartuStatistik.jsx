'use client';
import React from 'react';
import { Users, CheckCircle2, XCircle } from 'lucide-react';

const KartuStatistik = ({ totalPendaftar, totalHadir, totalBelumHadir, persenHadir, persenBelumHadir, apakahIndividu }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

      {/* Card Total Terdaftar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-slate-900 text-[12.5px] sm:text-[11.5px] lg:text-[11px] xl:text-[12px] font-bold uppercase tracking-wide">
            TOTAL TERDAFTAR ({apakahIndividu ? 'PESERTA' : 'TIM'})
          </p>
          <h3 className="text-2xl sm:text-2xl lg:text-[22px] xl:text-2xl font-black text-slate-900 mt-1 sm:mt-1.5">{totalPendaftar}</h3>
        </div>
        <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-13 lg:h-13 p-2 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7" />
        </div>
      </div>

      {/* Card Sudah Hadir */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-slate-900 text-[12.5px] sm:text-[11.5px] lg:text-[11px] xl:text-[12px] font-bold uppercase tracking-wide">SUDAH HADIR</p>
          <div className="flex items-baseline gap-2 mt-1 sm:mt-1.5">
            <h3 className="text-2xl sm:text-2xl lg:text-[22px] xl:text-2xl font-black text-slate-950">{totalHadir}</h3>
            <span className="text-xs sm:text-[11px] lg:text-[10.5px] xl:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {persenHadir}%
            </span>
          </div>
        </div>
        <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-13 lg:h-13 p-2 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7" />
        </div>
      </div>

      {/* Card Belum Hadir */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-slate-900 text-[12.5px] sm:text-[11.5px] lg:text-[11px] xl:text-[12px] font-bold uppercase tracking-wide">BELUM HADIR</p>
          <div className="flex items-baseline gap-2 mt-1 sm:mt-1.5">
            <h3 className="text-2xl sm:text-2xl lg:text-[22px] xl:text-2xl font-black text-slate-950">{totalBelumHadir}</h3>
            <span className="text-xs sm:text-[11px] lg:text-[10.5px] xl:text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {persenBelumHadir}%
            </span>
          </div>
        </div>
        <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-13 lg:h-13 p-2 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
          <XCircle className="w-6 h-6 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7" />
        </div>
      </div>

    </div>
  );
};

export default KartuStatistik;
