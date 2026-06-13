'use client';
import React, { useState, useMemo } from 'react';
// Import Icon
import {
  Settings, Save, Calendar, CheckCircle2,
  Image as ImageIcon, Plus, Upload, Trash2, Link, FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  handleUpdateLombaDashboardLocal,
  prosesUploadFile
}) => {
  const [subTab, setSubTab] = useState('whatsapp');

  // Helper untuk perubahan input form
  const handleInputChange = (field) => (e) => {
    setUmum(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Parsing foto dokumentasi list (Memoized)
  const listFoto = useMemo(() => {
    let list = [];
    try {
      if (umum.foto_dokumentasi_list) {
        list = JSON.parse(umum.foto_dokumentasi_list);
      }
    } catch (err) {
      console.error("Gagal parse foto_dokumentasi_list:", err);
    }
    while (list.length < 8) {
      list.push('');
    }
    return list.slice(0, 8);
  }, [umum.foto_dokumentasi_list]);

  // Pengelompokan Grup WA Lomba berdasarkan Kategori (Memoized)
  const kategoriLombaGrup = useMemo(() => {
    const unikKategori = Array.from(
      new Set(daftarLombaDashboard.map(l => l.nama.replace(/\s+(JUNIOR|SENIOR)$/i, '').trim()))
    );
    return unikKategori.map(kategori => {
      const lombaTerkait = daftarLombaDashboard.filter(l => l.nama.replace(/\s+(JUNIOR|SENIOR)$/i, '').trim() === kategori);
      const linkSekarang = lombaTerkait[0]?.grup_wa || '';
      const namaFormat = kategori.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      return {
        kategori,
        lombaTerkait,
        linkSekarang,
        namaFormat
      };
    });
  }, [daftarLombaDashboard]);

  // Fungsi Upload Dokumentasi Satu per Satu
  const handleUploadSingleFoto = async (index, file) => {
    if (!file) return;
    const path = await prosesUploadFile(file, 'dokumentasi', "Mengunggah foto...");
    if (path) {
      const newList = [...listFoto];
      newList[index] = path;
      setUmum(prev => ({
        ...prev,
        foto_dokumentasi_list: JSON.stringify(newList.filter(Boolean))
      }));
      toast.success("Foto berhasil diunggah");
    }
  };

  // Fungsi Hapus Dokumentasi Satu per Satu
  const handleHapusSingleFoto = (index) => {
    const newList = [...listFoto];
    newList[index] = '';
    setUmum(prev => ({
      ...prev,
      foto_dokumentasi_list: JSON.stringify(newList.filter(Boolean))
    }));
    toast.success("Foto dihapus");
  };

  // Fungsi Upload Dokumentasi Massal
  const handleUploadBatchFoto = async (files) => {
    if (!files || files.length === 0) return;
    const filesToUpload = Array.from(files).slice(0, 8);
    const toastId = toast.loading(`Mengunggah ${filesToUpload.length} foto...`);
    try {
      const uploadPromises = filesToUpload.map(file =>
        prosesUploadFile(file, 'dokumentasi', null)
      );

      // Menggabungkan Hasil Upload
      const paths = await Promise.all(uploadPromises);
      const validPaths = paths.filter(Boolean);
      if (validPaths.length > 0) {
        const newList = [...listFoto];
        let pathIdx = 0;
        for (let i = 0; i < 8 && pathIdx < validPaths.length; i++) {
          if (filesToUpload.length === 8) {
            newList[i] = validPaths[pathIdx];
            pathIdx++;
          } else if (!newList[i]) {
            newList[i] = validPaths[pathIdx];
            pathIdx++;
          }
        }

        // Memperbarui State
        setUmum(prev => ({
          ...prev,
          foto_dokumentasi_list: JSON.stringify(newList.filter(Boolean))
        }));
        toast.success(`Berhasil mengunggah ${validPaths.length} foto`, { id: toastId });
      } else {
        toast.error("Gagal mengunggah foto", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal unggah massal", { id: toastId });
    }
  };

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
              onChange={handleInputChange('judul_hero')}
              placeholder={`Contoh: SGDRC ${new Date().getFullYear()}`}
            />

            {/* Input Tagline */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700">Tagline</label>
              <textarea
                rows="2"
                disabled={!modeEditUmum}
                value={umum.deskripsi_hero}
                onChange={handleInputChange('deskripsi_hero')}
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
              onChange={handleInputChange('tanggal_event')}
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
                onChange={handleInputChange('bank_nama')}
              />

              {/* Input Atas Nama */}
              <FormInput
                label="Atas Nama"
                disabled={!modeEditUmum}
                value={umum.bank_atas_nama}
                onChange={handleInputChange('bank_atas_nama')}
              />

              {/* Input Nomor Rekening */}
              <FormInput
                label="Nomor Rekening"
                disabled={!modeEditUmum}
                value={umum.bank_rekening}
                onChange={handleInputChange('bank_rekening')}
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

        {/* Container WhatsApp & Dokumentasi */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">

          {/* Container Header Tab (Tinggi h-[55px] dan bg-emerald-600) */}
          <div className="h-[55px] px-4 bg-emerald-600 flex items-center justify-between gap-3 flex-shrink-0">
            {/* Tombol WhatsApp */}
            <button
              type="button"
              onClick={() => setSubTab('whatsapp')}
              className={`flex-1 flex items-center justify-center h-[38px] rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${subTab === 'whatsapp'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              WhatsApp Center
            </button>

            {/* Tombol Dokumentasi */}
            <button
              type="button"
              onClick={() => setSubTab('dokumentasi')}
              className={`flex-1 flex items-center justify-center h-[38px] rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${subTab === 'dokumentasi'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              Dokumentasi
            </button>
          </div>

          {/* Container Konten */}
          <div className="p-6 space-y-6">
            {subTab === 'whatsapp' ? (
              <div className="space-y-6 animate-in slide-in-from-left duration-300">

                {/* Container WhatsApp Utama */}
                <div className="space-y-2">
                  <label className={`text-[12px] font-bold transition-colors ${modeEditUmum ? 'text-slate-700' : 'text-emerald-600'}`}>
                    Link WhatsApp Utama
                  </label>

                  <input
                    type="text"
                    disabled={!modeEditUmum}
                    value={umum.wa_link_umum || ''}
                    onChange={handleInputChange('wa_link_umum')}
                    placeholder="Masukkan link WhatsApp"
                    className={`w-full rounded-xl px-5 py-2.5 text-[12px] font-medium transition-all outline-none ${modeEditUmum
                      ? 'bg-white border-2 border-slate-300 text-[#0B255D] focus:border-emerald-500 shadow-sm'
                      : 'bg-slate-50 border-2 border-transparent text-slate-400 cursor-not-allowed'
                      }`}
                  />
                </div>

                {/* Container Grup WA Per Lomba */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <label className={`text-[12px] font-bold transition-colors ${modeEditUmum ? 'text-slate-700' : 'text-emerald-600'}`}>
                      Grup WA Per Lomba
                    </label>
                  </div>

                  {/* Container Grup WA Per Lomba */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {kategoriLombaGrup.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 relative group">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[12px] font-bold text-slate-700">
                            {item.namaFormat}
                          </span>
                        </div>

                        {/* Input Link Grup WA Per Lomba */}
                        <input
                          type="text"
                          disabled={!modeEditUmum}
                          value={item.linkSekarang}
                          onChange={(e) => {
                            const linkBaru = e.target.value;
                            item.lombaTerkait.forEach(l => {
                              handleUpdateLombaDashboardLocal(l.id, 'grup_wa', linkBaru);
                            });
                          }}
                          placeholder="Masukkan link WhatsApp"
                          className={`w-full rounded-xl px-4 py-2.5 text-[12px] font-medium transition-all outline-none ${modeEditUmum
                            ? 'bg-white border-2 border-slate-300 text-[#0B255D] focus:border-emerald-500 shadow-sm'
                            : 'bg-slate-50 border-2 border-transparent text-slate-400 cursor-not-allowed'
                            }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                {/* Link Google Drive Utama */}
                <div className="space-y-2">
                  <label className={`text-[12px] font-bold transition-colors ${modeEditUmum ? 'text-slate-700' : 'text-emerald-600'}`}>
                    Link Google Drive Utama
                  </label>

                  {/* Input Link Google Drive Utama */}
                  <input
                    type="text"
                    disabled={!modeEditUmum}
                    value={umum.link_dokumentasi || ''}
                    onChange={handleInputChange('link_dokumentasi')}
                    placeholder="Masukkan link Google Drive"
                    className={`w-full rounded-xl px-5 py-2.5 text-[12px] font-medium transition-all outline-none ${modeEditUmum
                      ? 'bg-white border-2 border-slate-300 text-[#0B255D] focus:border-emerald-500 shadow-sm'
                      : 'bg-slate-50 border-2 border-transparent text-slate-400 cursor-not-allowed'
                      }`}
                  />
                </div>

                {/* Unggah Foto Grid */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <label className={`text-[12px] font-bold transition-colors ${modeEditUmum ? 'text-slate-700' : 'text-emerald-600'}`}>
                      Foto Display (Maks 8 Foto)
                    </label>
                    {modeEditUmum && (
                      <div>
                        <button
                          type="button"
                          onClick={() => document.getElementById('batch-upload-foto-dokumentasi').click()}
                          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-xl text-[10px] font-medium transition-all flex items-center gap-1.5 border border-emerald-100"
                        >
                          <Upload size={12} /> Unggah Sekaligus
                        </button>
                        <input
                          type="file"
                          id="batch-upload-foto-dokumentasi"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleUploadBatchFoto(e.target.files)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Grid 4x2 */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {listFoto.map((foto, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-slate-200 border border-slate-300 group flex items-center justify-center">
                        {foto ? (
                          <>
                            <img src={foto} className="w-full h-full object-cover" alt={`Dokumentasi ${idx + 1}`} />
                            {modeEditUmum && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                                <button
                                  type="button"
                                  onClick={() => document.getElementById(`upload-foto-single-${idx}`).click()}
                                  className="p-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-md transition-all"
                                  title="Ganti Foto"
                                >
                                  <Upload size={12} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleHapusSingleFoto(idx)}
                                  className="p-1.5 bg-rose-500 text-white hover:bg-rose-600 rounded-md transition-all"
                                  title="Hapus"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-1.5 text-center text-slate-400 w-full h-full">
                            <ImageIcon size={14} className="mb-0.5 text-slate-300" />
                            <span className="text-[7px] font-bold uppercase tracking-tight">Slot {idx + 1}</span>
                            {modeEditUmum && (
                              <button
                                type="button"
                                onClick={() => document.getElementById(`upload-foto-single-${idx}`).click()}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            )}
                          </div>
                        )}
                        <input
                          type="file"
                          id={`upload-foto-single-${idx}`}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleUploadSingleFoto(idx, e.target.files[0])}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Umum;
