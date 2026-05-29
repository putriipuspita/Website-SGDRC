'use client';
import React from 'react';
// Import Icon
import {
  LayoutGrid, Users, ImageIcon, Plus, Trash2,
  MessageCircle, Save, FileText, Upload
} from 'lucide-react';

// Import Komponen
import ModalBase from '../../../element/ModalBase';
import Konfirmasi from '../../../element/Konfirmasi';
import toast from 'react-hot-toast';

// Import Utility
import { fetchDenganToken } from '@/lib/apiClient';

// Komponen Utama Aksi
const Aksi = ({
  apakahModalLombaTerbuka,
  setApakahModalLombaTerbuka,
  lombaTerpilih,
  setLombaTerpilih,
  targetLomba,
  simpanLomba,
  apakahModalGuidebookTerbuka,
  setApakahModalGuidebookTerbuka,
  guidebookTerpilih,
  setGuidebookTerpilih,
  simpanGuidebook,
  tanganiUploadLombaModal,
  tanganiUploadGuidebookModal,
  apakahModalHapusGbTerbuka,
  setApakahModalHapusGbTerbuka,
  dataGbHapus,
  setDataGbHapus,
  ambilData
}) => {
  return (
    <>
      {/* Modal Edit / Tambah Lomba */}
      <ModalBase
        apakahTerbuka={apakahModalLombaTerbuka && !!lombaTerpilih}
        setApakahTerbuka={setApakahModalLombaTerbuka}

        // Judul modal berubah sesuai target dan kondisi edit/tambah
        judul={targetLomba === 'landing'
          ? (lombaTerpilih?.id ? 'Edit Kategori Landing Page' : 'Tambah Kategori Landing Page')
          : (lombaTerpilih?.id ? 'Edit Cabang Dashboard' : 'Tambah Cabang Dashboard')
        }

        // Icon berubah berdasarkan target
        icon={targetLomba === 'landing' ? LayoutGrid : Users}
        iconColor={targetLomba === 'landing' ? "text-[#16B9FF]" : "text-[#E40011]"}
        footer={
          <>

            {/* Tombol hapus hanya muncul saat edit */}
            {lombaTerpilih?.id ? (
              <button
                onClick={() => {
                  setDataGbHapus({ ...lombaTerpilih, judul: targetLomba === 'landing' ? lombaTerpilih.judul : lombaTerpilih.nama, target: targetLomba });
                  setApakahModalHapusGbTerbuka(true);
                }}
                className="flex items-center gap-2 text-rose-500 hover:text-rose-700 text-[10px] font-black uppercase tracking-wide transition-all"
              >
                <Trash2 size={16} /> Hapus {targetLomba === 'landing' ? 'Kategori' : 'Cabang'}
              </button>
            ) : <div></div>}

            {/* Container Tombol */}
            <div className="flex gap-3">

              {/* Tombol batal */}
              <button
                onClick={() => setApakahModalLombaTerbuka(false)}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 text-[10px] font-black uppercase tracking-wide hover:bg-slate-100 transition-all"
              >
                Batal
              </button>

              {/* Tombol simpan */}
              <button
                onClick={() => simpanLomba(lombaTerpilih, lombaTerpilih.id ? 'update' : 'tambah')}
                className="px-8 py-3 rounded-xl bg-[#0B255D] hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wide shadow-lg shadow-[#0B255D]/20 transition-all flex items-center gap-2"
              >
                <Save size={16} /> {lombaTerpilih?.id ? 'Simpan Perubahan' : 'Tambah Baru'}
              </button>
            </div>
          </>
        }
      >
        {lombaTerpilih && (
          <>
            {/* Preview Tampilan Lomba */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              {/* Label */}
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <ImageIcon size={12} /> Preview Tampilan
              </p>

              {/* Container Preview */}
              <div className="flex gap-4 items-start">
                {/* Gambar */}
                <div className="w-24 aspect-[4/3] rounded-xl bg-white shadow-sm overflow-hidden flex-shrink-0 border border-slate-100">
                  <img src={lombaTerpilih.gambar || '/aset/logo/placeholder.png'} className="w-full h-full object-cover" />
                </div>

                {/* Judul & Deskripsi */}
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#0B255D] uppercase leading-tight">{lombaTerpilih.judul || lombaTerpilih.nama || 'Nama Lomba'}</h4>
                  <p className="text-[9px] text-slate-500 line-clamp-2 leading-tight">{lombaTerpilih.deskripsi || (targetLomba === 'dashboard' ? `Jenjang: ${lombaTerpilih.jenjang}` : 'Belum ada deskripsi...')}</p>
                </div>
              </div>
            </div>

            {/* Formulir Lomba Landing Page & Dashboard */}
            {targetLomba === 'landing' ? (
              // Landing Page
              <div className="space-y-6">
                {/* Judul Kategori Lomba */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Judul Kategori Lomba</label>
                  <input
                    value={lombaTerpilih.judul}
                    onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, judul: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#16B9FF]"
                    placeholder="Contoh: Robot Soccer"
                  />
                </div>

                {/* Deskripsi Singkat */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Deskripsi Singkat</label>
                  <textarea
                    value={lombaTerpilih.deskripsi}
                    onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, deskripsi: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#16B9FF] resize-none"
                    placeholder="Jelaskan secara singkat lomba ini..."
                  />
                </div>

                {/* Container Editor Label / Tombol */}
                <div className="space-y-4">

                  {/* Header Label */}
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Tombol Kategori (Merah/Biru)</label>

                    {/* Tombol Label Baru */}
                    <button
                      onClick={() => setLombaTerpilih({ ...lombaTerpilih, label: [...(lombaTerpilih.label || []), { teks: '', sub: '' }] })}
                      className="text-[#16B9FF] text-[9px] font-black uppercase tracking-wide flex items-center gap-1"
                    >
                      <Plus size={12} /> Tambah Tombol
                    </button>
                  </div>

                  {/* Container List Label */}
                  <div className="grid grid-cols-1 gap-3">
                    {(lombaTerpilih.label || []).map((lb, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-200 group">

                        {/* Container Input Teks Label */}
                        <div className="flex-1 grid grid-cols-2 gap-3">

                          {/* Input Teks Utama */}
                          <input
                            placeholder="Teks Utama (TK)"
                            value={lb.teks}
                            onChange={(e) => {
                              const newLabels = [...lombaTerpilih.label];
                              newLabels[idx].teks = e.target.value;
                              setLombaTerpilih({ ...lombaTerpilih, label: newLabels });
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-[#16B9FF]"
                          />

                          {/* Input Sub Teks */}
                          <input
                            placeholder="Sub Teks (Junior)"
                            value={lb.sub}
                            onChange={(e) => {
                              const newLabels = [...lombaTerpilih.label];
                              newLabels[idx].sub = e.target.value;
                              setLombaTerpilih({ ...lombaTerpilih, label: newLabels });
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-[#16B9FF]"
                          />
                        </div>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => {
                            const newLabels = [...lombaTerpilih.label];
                            newLabels.splice(idx, 1);
                            setLombaTerpilih({ ...lombaTerpilih, label: newLabels });
                          }}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (


              /* Dashboard */
              <div className="space-y-6">
                {/* Container Nama Cabang dan Jenjang */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Nama Cabang*/}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Nama Cabang (Full)</label>
                    <input
                      value={lombaTerpilih.nama}
                      onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, nama: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#E40011]"
                      placeholder="Contoh: Robot Soccer Senior"
                    />
                  </div>

                  {/* Jenjang Pendidikan */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Jenjang Pendidikan</label>
                    <input
                      value={lombaTerpilih.jenjang}
                      onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, jenjang: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#E40011]"
                      placeholder="Contoh: SMP / SMA"
                    />
                  </div>
                </div>

                {/* Container Harga dan Jumlah Tim */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Harga */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Harga (IDR)</label>
                    <input
                      value={lombaTerpilih.harga}
                      onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, harga: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#E40011]"
                    />
                  </div>

                  {/* Jumlah Tim */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Tim (Kuota)</label>
                    <input
                      value={lombaTerpilih.tim}
                      onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, tim: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#E40011]"
                    />
                  </div>

                  {/* Status Pendaftaran */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Status Pendaftaran</label>
                    <select
                      value={lombaTerpilih.status}
                      onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#E40011] appearance-none"
                    >
                      <option value="Open">OPEN</option>
                      <option value="Close">CLOSE</option>
                    </select>
                  </div>
                </div>

                {/* Tanggal Pelaksanaan */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Tanggal Pelaksanaan</label>
                  <input
                    value={lombaTerpilih.tanggal}
                    onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, tanggal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#E40011]"
                  />
                </div>
              </div>
            )}

            {/* Container URL Gambar */}
            <div className="space-y-2">
              {/* Label */}
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">URL Gambar / Logo Lomba</label>

              {/* Container Input dan Upload */}
              <div className="flex gap-2">
                {/* Input Gambar */}
                <input
                  value={lombaTerpilih.gambar}
                  onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, gambar: e.target.value })}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#16B9FF]"
                  placeholder="https://..."
                />

                {/* Button Upload */}
                <button
                  onClick={() => document.getElementById('file-upload-lomba').click()}
                  className="px-4 bg-[#0B255D] text-white rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wide"
                >
                  <Upload size={14} /> Upload
                  <input
                    type="file"
                    id="file-upload-lomba"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => tanganiUploadLombaModal(e.target.files[0])}
                  />
                </button>
              </div>
            </div>

            {/* URL Link WA (Hanya untuk Dashboard) */}
            {targetLomba === 'dashboard' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#25D366] uppercase tracking-wide flex items-center gap-2">
                  <MessageCircle size={12} /> Link Grup WhatsApp Khusus
                </label>
                <input
                  value={lombaTerpilih.grup_wa}
                  onChange={(e) => setLombaTerpilih({ ...lombaTerpilih, grup_wa: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#25D366]"
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
            )}
          </>
        )}
      </ModalBase>

      {/* Aksi Guide Book */}
      <ModalBase
        apakahTerbuka={apakahModalGuidebookTerbuka && !!guidebookTerpilih}
        setApakahTerbuka={setApakahModalGuidebookTerbuka}
        judul={guidebookTerpilih?.id ? 'Edit Guidebook' : 'Tambah Guidebook'}
        icon={FileText}
        lebar="max-w-lg"
        footer={
          <>
            {guidebookTerpilih?.id ? (
              // Button Hapus
              <button
                onClick={() => { if (window.confirm('Hapus guidebook ini?')) simpanGuidebook(guidebookTerpilih, 'hapus'); }}
                className="flex items-center gap-2 text-rose-500 hover:text-rose-700 text-[10px] font-black uppercase tracking-wide transition-all"
              >
                <Trash2 size={16} /> Hapus
              </button>
            ) : <div></div>}

            {/* Container Tombol */}
            <div className="flex gap-3">
              {/* Button Batal */}
              <button
                onClick={() => setApakahModalGuidebookTerbuka(false)}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 text-[10px] font-black uppercase tracking-wide hover:bg-slate-100 transition-all"
              >
                Batal
              </button>

              {/* Button Simpan */}
              <button
                onClick={() => simpanGuidebook(guidebookTerpilih, guidebookTerpilih.id ? 'update' : 'tambah')}
                className="px-8 py-3 rounded-xl bg-[#0B255D] hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wide shadow-lg shadow-[#0B255D]/20 transition-all flex items-center gap-2"
              >
                <Save size={16} /> Simpan
              </button>
            </div>
          </>
        }
      >
        {guidebookTerpilih && (
          <>
            {/* Judul */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Judul GuideBook</label>
              <input
                value={guidebookTerpilih.judul}
                onChange={(e) => setGuidebookTerpilih({ ...guidebookTerpilih, judul: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#16B9FF]"
                placeholder="Contoh: Juknis Umum"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Deskripsi Singkat</label>
              <textarea
                value={guidebookTerpilih.deskripsi}
                onChange={(e) => setGuidebookTerpilih({ ...guidebookTerpilih, deskripsi: e.target.value })}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#16B9FF] resize-none"
                placeholder="Penjelasan singkat materi..."
              />
            </div>

            {/* Containe Gambar */}
            <div className="space-y-2">
              {/* Label */}
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">URL Cover / Foto</label>

              {/* Container Input dan Upload */}
              <div className="flex gap-2">
                {/* Input Foto */}
                <input
                  value={guidebookTerpilih.foto}
                  onChange={(e) => setGuidebookTerpilih({ ...guidebookTerpilih, foto: e.target.value })}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#16B9FF]"
                  placeholder="https://..."
                />

                {/* Tombol Upload */}
                <button
                  onClick={() => document.getElementById('file-upload-gb').click()}
                  className="px-4 bg-[#0B255D] text-white rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wide"
                >
                  <Upload size={14} /> Upload
                  <input
                    type="file"
                    id="file-upload-gb"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => tanganiUploadGuidebookModal(e.target.files[0])}
                  />
                </button>
              </div>
            </div>

            {/* Link URL Guide Book */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">URL Tautan (Google Drive/PDF)</label>
              <input
                value={guidebookTerpilih.tautan}
                onChange={(e) => setGuidebookTerpilih({ ...guidebookTerpilih, tautan: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-[#16B9FF]"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </>
        )}
      </ModalBase>

      {/* Modal Konfirmasi Hapus Umum (Guidebook & Lomba) */}
      <Konfirmasi
        apakahTerbuka={apakahModalHapusGbTerbuka}
        setApakahTerbuka={setApakahModalHapusGbTerbuka}
        dataNama={dataGbHapus?.judul || dataGbHapus?.nama || 'Data ini'}
        onConfirm={async () => {
          try {
            let payload = {};

            if (dataGbHapus.target) {
              // Hapus Lomba
              payload = { lomba: { id: dataGbHapus.id, target: dataGbHapus.target, aksi: 'hapus' } };
            } else {
              // Hapus Guidebook
              payload = { guidebook: { id: dataGbHapus.id, aksi: 'hapus' } };
            }

            // Mengirim Data ke API
            const res = await fetchDenganToken('/api/admin/informasi', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              toast.success("Berhasil Dihapus");
              ambilData(false);
              setApakahModalHapusGbTerbuka(false);
            } else {
              toast.error("Gagal Menghapus Data");
            }
          } catch (error) {
            toast.error("Kesalahan Sistem");
          }
        }}
        tipe={dataGbHapus?.target ? (dataGbHapus.target === 'landing' ? 'kategori lomba' : 'cabang lomba') : 'panduan'}
      />
    </>
  );
};

export default Aksi;
