'use client';
import React from 'react';
import { Plus, Save, Settings, Upload, ExternalLink, Trash2 } from 'lucide-react';

// Komponen Utama Guidebook
const Guidebook = ({
  daftarGuidebook,
  modeEditGuidebook,
  setModeEditGuidebook,
  tambahGuidebook,
  simpanSemuaGuidebook,
  handleUpdateGuidebookLocal,
  tanganiUploadGuidebook,
  setDataGbHapus,
  setApakahModalHapusGbTerbuka
}) => {
  return (
    // Halaman Bagian Guidebook
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      {/* Container Header */}
      <div className="p-5 flex justify-end items-center gap-3 border-b border-slate-100">
        {/* Tombol Tambah */}
        <button
          onClick={tambahGuidebook}
          className="bg-[#0B255D] hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Tambah Guidebook
        </button>

        {/* Tombol Edit dan Simpan */}
        <button
          onClick={() => {
            if (modeEditGuidebook) simpanSemuaGuidebook();
            setModeEditGuidebook(!modeEditGuidebook);
          }}
          className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 shadow-sm ${modeEditGuidebook
            ? 'bg-emerald-500 text-white'
            : 'bg-white border border-slate-200 text-[#0B255D] hover:bg-slate-50'
            }`}
        >
          {modeEditGuidebook ? <><Save size={16} /> Simpan Semua</> : <><Settings size={16} /> Edit Tabel</>}
        </button>
      </div>

      {/* Tabel Isi GuideBook */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header Tabel */}
          <thead>
            <tr className="bg-[#0B255D] border-b border-white/20">
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[90px]">Foto</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap">Judul Panduan</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap max-w-[300px]">Deskripsi</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide text-center whitespace-nowrap w-[120px]">Tautan & Aksi</th>
            </tr>
          </thead>

          {/* Isi Tabel */}
          <tbody className="divide-y divide-slate-200">
            {daftarGuidebook.map((gb) => (
              <tr key={gb.id} className="hover:bg-slate-50/50 transition-colors group text-slate-600">
                {/* Kolom Foto */}
                <td className="px-4 py-3 border-r border-slate-200 text-center">
                  <div className="relative w-16 aspect-video rounded-lg bg-slate-100 overflow-hidden border border-slate-200 inline-block">
                    {/* Tampilan Foto */}
                    <img src={gb.foto || '/aset/logo/placeholder.png'} className="w-full h-full object-cover" />

                    {/* Mode Edit */}
                    {modeEditGuidebook && (
                      // Tombol Ganti Foto
                      <button
                        onClick={() => document.getElementById(`file-gb-${gb.id}`).click()}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >

                        {/* Icon dan Input Foto */}
                        <Upload className="text-white" size={12} />
                        <input
                          type="file"
                          id={`file-gb-${gb.id}`}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => tanganiUploadGuidebook(gb.id, e.target.files[0])}
                        />
                      </button>
                    )}
                  </div>
                </td>

                {/* Kolom Judul */}
                <td className="px-4 py-3 border-r border-slate-200 leading-normal text-center whitespace-nowrap">
                  {modeEditGuidebook ? (
                    // Mode Edit
                    <input
                      value={gb.judul}
                      onChange={(e) => handleUpdateGuidebookLocal(gb.id, 'judul', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11.5px] font-medium text-slate-600 tracking-wide outline-none text-center"
                      placeholder="Judul..."
                    />
                  ) : (

                    // Tampilan Judul
                    <span className="text-[11.5px] font-medium text-slate-600 tracking-wide block text-center leading-normal">
                      {gb.judul}
                    </span>
                  )}
                </td>

                {/* Kolom Deskripsi */}
                <td className="px-4 py-3 border-r border-slate-200 leading-normal max-w-[300px]">
                  {modeEditGuidebook ? (
                    // Mode Edit
                    <textarea
                      value={gb.deskripsi}
                      onChange={(e) => handleUpdateGuidebookLocal(gb.id, 'deskripsi', e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11.5px] font-medium text-slate-600 tracking-wide outline-none resize-none text-justify"
                    />
                  ) : (

                    // Tampilan Deskripsi
                    <p className="text-[11.5px] font-medium text-slate-600 tracking-wide leading-relaxed line-clamp-2 text-justify capitalize">
                      {gb.deskripsi}
                    </p>
                  )}
                </td>

                {/* Kolom Tautan dan Aksi */}
                <td className="px-4 py-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1.5">
                    {modeEditGuidebook ? (
                      // Mode Edit
                      <input
                        value={gb.tautan}
                        onChange={(e) => handleUpdateGuidebookLocal(gb.id, 'tautan', e.target.value)}
                        placeholder="URL..."
                        className="w-32 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11.5px] font-medium text-slate-600 tracking-wide outline-none text-center"
                      />
                    ) : (

                      // Tampilan Tautan
                      <a
                        href={gb.tautan}
                        target="_blank"
                        className="w-7 h-7 flex items-center justify-center bg-[#16B9FF] hover:bg-[#1299d4] text-white rounded-md transition-all active:scale-95 shadow-lg shadow-[#16B9FF]/20"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    {/* Tombol Hapus */}
                    <button
                      onClick={() => {
                        setDataGbHapus(gb);
                        setApakahModalHapusGbTerbuka(true);
                      }}
                      className="w-7 h-7 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-md transition-all border border-red-500/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Guidebook;
