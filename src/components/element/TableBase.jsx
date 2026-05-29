import React from 'react';
import { Loader2 } from 'lucide-react';

export const TableBase = ({
  headers = [],
  loading = false,
  loadingText = 'Memuat Data...',
  isEmpty = false,
  emptyText = 'Data Belum Ada',
  notFound = false,
  notFoundText = 'Data tidak ditemukan',
  children
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.05),0_0_20px_rgba(22,185,255,0.06)] overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          {/* Header Tabel */}
          <thead>
            <tr className="bg-[#0B255D] border-b border-white/20">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-4 text-[10px] font-black text-white uppercase tracking-wide border-white/10 text-center ${idx < headers.length - 1 ? 'border-r' : ''
                    } ${header.className || ''}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Isi Tabel */}
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 size={30} className="text-[#16B9FF] animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{loadingText}</p>
                  </div>
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="py-16 text-center text-slate-400 font-bold uppercase text-[11px] tracking-wide">
                  {emptyText}
                </td>
              </tr>
            ) : notFound ? (
              <tr>
                <td colSpan={headers.length} className="py-16 text-center text-slate-400 font-bold uppercase text-[11px] tracking-wide">
                  {notFoundText}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
