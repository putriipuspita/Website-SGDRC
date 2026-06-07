'use client';
import React from 'react';
// Import Icon
import {
  Settings, Save, Calendar, CheckCircle2,
  Image as ImageIcon, Plus, Upload, Trash2
} from 'lucide-react';

// Import Component
import { FormInput } from '../../../element/FormInput';

// Komponen Utama Menu Umum
const Umum = ({
  umum,
  setUmum,
  modeEditUmum,
  setModeEditUmum,
  simpanSemuaUmum,
  tambahSponsor,
  tanganiUploadSponsor,
  aksiSponsor,
  setTabAktif,
  daftarLombaDashboard = [],
  handleUpdateLombaDashboardLocal
}) => {
  return (
    // Halaman Bagian Menu Umum
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Container Bagian Atas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Container Tampilan Landing Page */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">

          {/* Container Header */}
          <div className="h-[55px] px-6 bg-[#0B255D] flex items-center justify-between flex-shrink-0">
            {/* Judul & Icon */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Settings className="text-white" size={16} />
              </div>
              <h2 className="text-white font-bold text-[13px] uppercase tracking-wide">TAMPILAN LANDING PAGE</h2>
            </div>

            {/* Tombol Edit & Save */}
            <button
              onClick={() => {
                if (modeEditUmum) simpanSemuaUmum();
                setModeEditUmum(!modeEditUmum);
              }}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 ${modeEditUmum
                ? 'bg-emerald-500 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
                }`}
            >
              {modeEditUmum ? <><Save size={12} /> Simpan</> : <><Settings size={12} /> Edit</>}
            </button>
          </div>

          {/* Container Konten Landing Page */}
          <div className="p-6 space-y-3 flex-1">
            {/* Input Judul Hero */}
            <FormInput
              label="Judul Hero (Singkatan)"
              disabled={!modeEditUmum}
              value={umum.judul_hero}
              onChange={(e) => setUmum({ ...umum, judul_hero: e.target.value })}
              placeholder={`Contoh: SGDRC ${new Date().getFullYear()}`}
            />

            {/* Input Tagline */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700">Tagline</label>
              <textarea
                rows="2"
                disabled={!modeEditUmum}
                value={umum.deskripsi_hero}
                onChange={(e) => setUmum({ ...umum, deskripsi_hero: e.target.value })}
                className={`w-full rounded-xl px-4 py-2.5 text-[12px] font-medium transition-all outline-none leading-relaxed ${modeEditUmum
                  ? 'bg-white border-2 border-slate-200 text-[#0B255D] focus:border-[#16B9FF]'
                  : 'bg-slate-50 border-2 border-transparent text-slate-400 cursor-not-allowed'
                  }`}
              />
            </div>

            {/* Input Waktu Event */}
            <FormInput
              label="Waktu Event"
              disabled={!modeEditUmum}
              value={umum.tanggal_event}
              onChange={(e) => setUmum({ ...umum, tanggal_event: e.target.value })}
              icon={Calendar}
            />
          </div>
        </div>

        {/* Container Rekening Pembayaran */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">

          {/* Container Header */}
          <div className="h-[55px] px-6 bg-[#E40011] flex items-center gap-3 flex-shrink-0">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <CheckCircle2 className="text-white" size={16} />
            </div>
            <h2 className="text-white font-bold text-[13px] uppercase tracking-wide">REKENING PEMBAYARAN</h2>
          </div>

          {/* Container Konten Rekening Pembayaran */}
          <div className="p-6 space-y-4 flex-1">
            <div className="space-y-4">
              {/* Input Nama Bank */}
              <FormInput
                label="Nama Bank"
                disabled={!modeEditUmum}
                value={umum.bank_nama}
                onChange={(e) => setUmum({ ...umum, bank_nama: e.target.value })}
              />

              {/* Input Atas Nama */}
              <FormInput
                label="Atas Nama"
                disabled={!modeEditUmum}
                value={umum.bank_atas_nama}
                onChange={(e) => setUmum({ ...umum, bank_atas_nama: e.target.value })}
              />

              {/* Input Nomor Rekening */}
              <FormInput
                label="Nomor Rekening"
                disabled={!modeEditUmum}
                value={umum.bank_rekening}
                onChange={(e) => setUmum({ ...umum, bank_rekening: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Container Baris 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Container Kolom Sponsor */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">

          {/* Container Header */}
          <div className="h-[55px] px-6 bg-[#16B9FF] flex items-center justify-between flex-shrink-0">
            {/* Judul dan Icon */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <ImageIcon className="text-white" size={16} />
              </div>
              <h2 className="text-white font-bold text-[13px] uppercase tracking-wide">LIST SPONSOR</h2>
            </div>

            {/* Tombol Tambah */}
            {modeEditUmum && (
              <button
                onClick={tambahSponsor}
                className="bg-white text-[#16B9FF] hover:bg-blue-50 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={12} /> Tambah
              </button>
            )}
          </div>

          {/* Container Konten Sponsor */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto scrollbar-hide">
            {/* Looping Data Sponsor */}
            {umum.sponsor_list.map((sp, idx) => (
              <div key={idx} className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${modeEditUmum ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-50 border-transparent'
                }`}>

                {/* Container Logo */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 p-2 flex items-center justify-center overflow-hidden shadow-inner">
                    {sp.logo ? (
                      <img src={sp.logo} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon className="text-slate-200" size={24} />
                    )}
                  </div>
                </div>

                {/* Container Input & Tombol */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  {/* Input Nama Sponsor */}
                  <input
                    disabled={!modeEditUmum}
                    value={sp.nama}
                    onChange={(e) => {
                      const baru = [...umum.sponsor_list];
                      baru[idx].nama = e.target.value;
                      setUmum({ ...umum, sponsor_list: baru });
                    }}
                    placeholder="Nama Sponsor..."
                    className={`w-full text-[12px] font-bold transition-all outline-none focus:outline-none focus:ring-0 truncate ${modeEditUmum ? 'text-[#0B255D] bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-200 focus:border-[#16B9FF]' : 'text-slate-500 bg-transparent'
                      }`}
                  />

                  {/* Tombol Aksi */}
                  {modeEditUmum && (
                    <div className="flex gap-1.5">
                      {/* Tombol Upload Logo */}
                      <button
                        onClick={() => document.getElementById(`file-sponsor-${sp.id}`).click()}
                        className="p-1.5 bg-blue-50 text-[#16B9FF] rounded-md hover:bg-[#16B9FF] hover:text-white transition-all flex items-center justify-center"
                        title="Ganti Logo"
                      >
                        <Upload size={12} />
                        <input type="file" id={`file-sponsor-${sp.id}`} className="hidden" accept="image/*" onChange={(e) => tanganiUploadSponsor(sp.id, e.target.files[0])} />
                      </button>

                      {/* Tombol Hapus */}
                      <button onClick={() => aksiSponsor('hapus', { id: sp.id })} className="p-1.5 bg-rose-50 text-rose-500 rounded-md hover:bg-rose-500 hover:text-white transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Container WhatsApp */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">

          {/* Container Header */}
          <div className="h-[55px] px-6 bg-emerald-600 flex items-center justify-between flex-shrink-0">
            {/* Judul dan Icon */}
            <div className="flex items-center gap-3">
              <div className="p-1 bg-white/10 rounded-lg">
                <img src="/aset/icon/whatsapp.png" className="w-6 h-6 object-contain brightness-0 invert" alt="WA" />
              </div>
              <h2 className="text-white font-bold text-[13px] uppercase tracking-wide">WHATSAPP CENTER</h2>
            </div>

            {/* Tombol Tambah */}
            {modeEditUmum && (
              <button
                onClick={() => setTabAktif('lomba')}
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={12} /> Tambah Grup
              </button>
            )}
          </div>

          {/* Container Konten WhatsApp */}
          <div className="p-6 space-y-6">
            {/* Container WhatsApp Utama */}
            <div className="space-y-2">
              {/* Label */}
              <label className={`text-[12px] font-bold transition-colors ${modeEditUmum ? 'text-slate-700' : 'text-emerald-600'}`}>
                Link WhatsApp Utama
              </label>

              {/* Input Link WhatsApp Utama */}
              <input
                type="text"
                disabled={!modeEditUmum}
                value={umum.wa_link_umum}
                onChange={(e) => setUmum({ ...umum, wa_link_umum: e.target.value })}
                placeholder="https://wa.me/..."
                className={`w-full rounded-xl px-5 py-2.5 text-[12px] font-medium transition-all outline-none ${modeEditUmum
                  ? 'bg-white border-2 border-slate-300 text-[#0B255D] focus:border-emerald-500 shadow-sm'
                  : 'bg-slate-50 border-2 border-transparent text-slate-400 cursor-not-allowed'
                  }`}
              />
            </div>

            {/* Container Grup WA Per Lomba */}
            <div className="space-y-3.5">
              {/* Label */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <label className={`text-[12px] font-bold transition-colors ${modeEditUmum ? 'text-slate-700' : 'text-emerald-600'}`}>
                  Grup WA Per Lomba
                </label>
              </div>

              {/* Grid Grup WA Per Lomba */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {Array.from(new Set(daftarLombaDashboard.map(l => l.nama.replace(/\s+(JUNIOR|SENIOR)$/i, '').trim()))).map((kategori, idx) => {
                  const lombaTerkait = daftarLombaDashboard.filter(l => l.nama.replace(/\s+(JUNIOR|SENIOR)$/i, '').trim() === kategori);
                  const linkSekarang = lombaTerkait.find(l => l.grup_wa)?.grup_wa || '';

                  // Ubah ke Title Case (Huruf depan besar)
                  const namaFormat = kategori.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                  return (
                    <div key={idx} className="space-y-1.5 relative group">

                      {/* Label Nama Kategori */}
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[12px] font-bold text-slate-700">
                          {namaFormat}
                        </span>
                      </div>

                      {/* Input Link WhatsApp */}
                      <input
                        type="text"
                        disabled={!modeEditUmum}
                        value={linkSekarang}
                        onChange={(e) => {
                          const linkBaru = e.target.value;
                          // Update SEMUA lomba yang memiliki kategori yang sama (Junior & Senior)
                          lombaTerkait.forEach(l => {
                            handleUpdateLombaDashboardLocal(l.id, 'grup_wa', linkBaru);
                          });
                        }}

                        // Placeholder
                        placeholder="https://chat.whatsapp.com/..."
                        className={`w-full rounded-xl px-4 py-2.5 text-[12px] font-medium transition-all outline-none ${modeEditUmum
                          ? 'bg-white border-2 border-slate-300 text-[#0B255D] focus:border-emerald-500 shadow-sm'
                          : 'bg-slate-50 border-2 border-transparent text-slate-400 cursor-not-allowed'
                          }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Umum;
