'use client';
import React, { useState, useEffect } from 'react';

// Import Icon
import {
  Calendar, Plus, Trash2, Save, Image as ImageIcon, Clock, Settings, UploadCloud
} from 'lucide-react';

// Import Komponent
import toast from 'react-hot-toast';
import { fetchDenganToken } from '@/lib/apiClient';

// Komponen Utama Jadwal
const formatRentangTanggal = (mulai, selesai) => {
  if (!mulai) return '';
  const opsiBulan = { month: 'long' };
  const dMulai = new Date(mulai);

  // Ambil Bagian Tanggal Mulai
  const hariMulai = dMulai.getDate();
  const bulanMulai = dMulai.toLocaleDateString('id-ID', opsiBulan);
  const tahunMulai = dMulai.getFullYear();

  if (!selesai || mulai === selesai) {
    return `${hariMulai} ${bulanMulai} ${tahunMulai}`;
  }

  // Ambil Bagian Tanggal Selesai
  const dSelesai = new Date(selesai);
  const hariSelesai = dSelesai.getDate();
  const bulanSelesai = dSelesai.toLocaleDateString('id-ID', opsiBulan);
  const tahunSelesai = dSelesai.getFullYear();

  // Format Penulisan Jika Beda Tahun
  if (tahunMulai !== tahunSelesai) {
    return `${hariMulai} ${bulanMulai} ${tahunMulai} - ${hariSelesai} ${bulanSelesai} ${tahunSelesai}`;
  }

  // Format Penulisan Jika Beda Bulan
  if (bulanMulai !== bulanSelesai) {
    return `${hariMulai} ${bulanMulai} - ${hariSelesai} ${bulanSelesai} ${tahunMulai}`;
  }

  // Format Penulisan Jika Bulan Sama
  return `${hariMulai} - ${hariSelesai} ${bulanMulai} ${tahunMulai}`;
};

// Fungsi Menentukan Status
const hitungStatus = (item) => {
  if (!item.mulai) return item.status || 'Akan Datang';

  // Ambil Tanggal Hari Ini
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  // Tanggal Mulai Timeline
  const tMulai = new Date(item.mulai);
  tMulai.setHours(0, 0, 0, 0);

  // Tanggal Selesai
  const tSelesai = item.selesai ? new Date(item.selesai) : tMulai;
  tSelesai.setHours(23, 59, 59, 999);

  // Kondisi
  if (hariIni < tMulai) {
    return 'Akan Datang';
  } else if (hariIni >= tMulai && hariIni <= tSelesai) {
    return 'Sedang Berlangsung';
  } else {
    return 'Selesai';
  }
};

// Fungsi Atur adwal
const Jadwal = ({ data, ambilData, prosesUploadFile }) => {
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);

  // State edit terpisah
  const [editPoster, setEditPoster] = useState(false);
  const [editTimeline, setEditTimeline] = useState(false);

  const [posterBaru, setPosterBaru] = useState(data.poster_utama || '');
  const [timeline, setTimeline] = useState([]);

  // Inisialisasi timeline dari JSON string
  useEffect(() => {
    if (data.timeline_list) {
      try {
        setTimeline(JSON.parse(data.timeline_list));
      } catch (e) {
        setTimeline([]);
      }
    }
  }, [data.timeline_list]);

  // Fungsi Tambah Timeline
  const tambahTimeline = () => {
    const itemBaru = {
      id: Date.now(),
      label: '',
      tanggal: '',
      status: 'Akan Datang',
      mulai: '',
      selesai: ''
    };
    setTimeline([...timeline, itemBaru]);
  };

  // Fungsi Hapus Timeline
  const hapusTimeline = (id) => {
    setTimeline(timeline.filter(item => item.id !== id));
  };

  // Fungsi Update Timeline
  const updateTimeline = (id, field, value) => {
    setTimeline(timeline.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Fungsi Upload Poster
  const tanganiUploadPoster = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const path = await prosesUploadFile(file, 'poster', "Mengunggah poster...");
    if (path) {
      setPosterBaru(path);
      toast.success("Poster berhasil diunggah");
    }
  };

  // Fungsi Simpan Perubahan
  const simpanPerubahan = async (tipe) => {
    setSedangMenyimpan(true);
    try {
      const payload = {
        umum: {
          poster_utama: posterBaru,
          timeline_list: JSON.stringify(timeline.map(item => ({
            ...item,
            status: hitungStatus(item),
            tanggal: formatRentangTanggal(item.mulai, item.selesai)
          })))
        }
      };

      // Request Simpan Data
      const res = await fetchDenganToken('/api/admin/informasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Jika Berhasil dan Gagal
      if (res.ok) {
        toast.success("Perubahan Berhasil Disimpan");
        if (tipe === 'poster') setEditPoster(false);
        if (tipe === 'timeline') setEditTimeline(false);
        await ambilData(false);
      } else {
        toast.error("Gagal Menyimpan Perubahan");
      }

      // Jika Server Error
    } catch (error) {
      console.error("Error Simpan:", error);
      toast.error("Terjadi Kesalahan Sistem");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  return (
    // Halaman Bagian Jadwal
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pb-10">

      {/* Container Konten Jadwal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Container Poster*/}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">

            {/* Container Header */}
            <div className="flex justify-between items-center mb-6">
              {/* Judul dan Icon */}
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#16B9FF]" />
                <h3 className="font-black text-slate-800 text-[13px] uppercase">Poster Utama</h3>
              </div>

              {/* Container Tombol */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (editPoster) simpanPerubahan('poster');
                    setEditPoster(!editPoster);
                  }}
                  disabled={sedangMenyimpan}
                  className={`px-4 py-2.5 rounded-xl text-[11.5px] sm:text-[11px] font-bold transition-all flex items-center gap-2 shadow-sm ${editPoster
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-[#0B255D] text-white hover:bg-blue-500'
                    } disabled:opacity-50`}
                >
                  {editPoster ? (
                    sedangMenyimpan ? (
                      <><Clock size={15} className="animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Save size={15} /> Simpan</>
                    )
                  ) : (
                    <><Settings size={15} /> Edit Poster</>
                  )}
                </button>
              </div>
            </div>

            {/* Container Gambar Poster */}
            <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 min-h-[400px] flex items-center justify-center">
              {posterBaru ? (
                // Tampilan Poster
                <img
                  src={posterBaru}
                  alt="Poster Utama"
                  className="w-full h-auto object-contain max-h-[600px]"
                />
              ) : (

                // Tampilan Jika Tidak Ada Poster
                <div className="text-center p-10">
                  <ImageIcon size={48} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed">Belum ada poster</p>
                </div>
              )}

              {/* Opsi Upload Poster */}
              {editPoster && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <label className="cursor-pointer bg-white p-4 rounded-full text-slate-800 shadow-xl hover:scale-110 transition-transform flex items-center justify-center">
                    <UploadCloud size={24} />
                    <input type="file" className="hidden" accept="image/*" onChange={tanganiUploadPoster} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Container Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">

            {/* Container Header */}
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
              {/* Judul dan Icon */}
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-emerald-500" />
                <h3 className="font-black text-slate-800 text-[13px] uppercase">Timeline Kegiatan</h3>
              </div>

              {/* Container Tombol */}
              <div className="flex gap-2">
                {editTimeline && (
                  <button
                    onClick={tambahTimeline}
                    className="bg-[#0B255D] hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-[11.5px] sm:text-[11px] font-bold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={15} /> Tambah
                  </button>
                )}
                <button
                  onClick={() => {
                    if (editTimeline) simpanPerubahan('timeline');
                    setEditTimeline(!editTimeline);
                  }}
                  disabled={sedangMenyimpan}
                  className={`px-4 py-2.5 rounded-xl text-[11.5px] sm:text-[11px] font-bold transition-all flex items-center gap-2 shadow-sm ${editTimeline
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-[#0B255D] text-white hover:bg-blue-500'
                    } disabled:opacity-50`}
                >
                  {editTimeline ? (
                    sedangMenyimpan ? (
                      <><Clock size={15} className="animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Save size={15} /> Simpan</>
                    )
                  ) : (
                    <><Settings size={15} /> Edit Tabel</>
                  )}
                </button>
              </div>
            </div>

            {/* Container Tabel */}
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <table className="w-full text-left border-collapse">
                {/* Header Tabel */}
                <thead>
                  <tr className="bg-[#0B255D]">
                    <th className="px-3 py-3 text-[10.5px] xl:text-[10.8px] 2xl:text-[11.8px] font-black text-white uppercase tracking-wide border-b border-white/10 text-center w-20">Status</th>
                    <th className="px-3 py-3 text-[10.5px] xl:text-[10.8px] 2xl:text-[11.8px] font-black text-white uppercase tracking-wide border-b border-white/10 text-center w-full">Kegiatan</th>
                    <th className="px-3 py-3 text-[10.5px] xl:text-[10.8px] 2xl:text-[11.8px] font-black text-white uppercase tracking-wide border-b border-white/10 text-center whitespace-nowrap">Tanggal Tampilan</th>
                    {editTimeline && <th className="px-3 py-3 text-[10.5px] xl:text-[10.8px] 2xl:text-[11.8px] font-black text-white uppercase tracking-wide border-b border-white/10 w-12 text-center">Aksi</th>}
                  </tr>
                </thead>

                {/* Isi Tabel */}
                <tbody className="divide-y divide-slate-100">
                  {timeline.length > 0 ? (
                    timeline.map((item) => {
                      const statusAktif = hitungStatus(item);
                      const formatTanggal = formatRentangTanggal(item.mulai, item.selesai) || item.tanggal;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">

                          {/* Status */}
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${statusAktif === 'Sedang Berlangsung' ? 'bg-[#16B9FF] animate-pulse shadow-[0_0_8px_rgba(22,185,255,0.5)]' :
                                statusAktif === 'Selesai' ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}></div>
                              <span className={`text-[10.6px] lg:text-[10.1px] xl:text-[10.3px] 2xl:text-[11.3px] font-black uppercase tracking-wide ${statusAktif === 'Sedang Berlangsung' ? 'text-[#16B9FF]' :
                                statusAktif === 'Selesai' ? 'text-emerald-500' : 'text-slate-400'
                                }`}>
                                {statusAktif}
                              </span>
                            </div>
                          </td>

                          {/* Kegiatan */}
                          <td className="px-3 py-4 text-center">
                            {!editTimeline ? (
                              <span className="text-[12.1px] lg:text-[11.6px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold text-slate-950">{item.label}</span>
                            ) : (
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateTimeline(item.id, 'label', e.target.value)}
                                placeholder="Kegiatan..."
                                className="w-full min-w-[180px] bg-white border border-slate-300 rounded-lg px-3 py-3 text-[12.1px] lg:text-[11.6px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold text-slate-950 outline-none focus:border-[#16B9FF] focus:ring-1 focus:ring-[#16B9FF]"
                              />
                            )}
                          </td>

                          {/* Tanggal Tampilan */}
                          <td className="px-3 py-4 text-center whitespace-nowrap">
                            {!editTimeline ? (
                              <span className="text-[12.1px] lg:text-[11.6px] xl:text-[11.7px] 2xl:text-[12.7px] font-medium text-slate-700">{formatTanggal}</span>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Input Tanggal Mulai */}
                                <input
                                  type="date"
                                  value={item.mulai || ''}
                                  onChange={(e) => updateTimeline(item.id, 'mulai', e.target.value)}
                                  className="w-[110px] bg-white border border-slate-200 rounded-md px-2 py-1 text-[12.1px] lg:text-[11.6px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold text-slate-950 outline-none focus:border-[#16B9FF]"
                                />

                                <span className="text-[10px] text-slate-400">s/d</span>

                                {/* Input Tanggal Selesai */}
                                <input
                                  type="date"
                                  value={item.selesai || ''}
                                  onChange={(e) => updateTimeline(item.id, 'selesai', e.target.value)}
                                  className="w-[110px] bg-white border border-slate-200 rounded-md px-2 py-1 text-[12.1px] lg:text-[11.6px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold text-slate-950 outline-none focus:border-[#16B9FF]"
                                />
                              </div>
                            )}
                          </td>
                          {editTimeline && (
                            // Tombol Hapus
                            <td className="px-3 py-4 text-center">
                              <button
                                onClick={() => hapusTimeline(item.id)}
                                className="p-1.5 bg-rose-50 text-rose-500 rounded-md hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center mx-auto"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (

                    // Tampilan Jika Data Timeline Kosong
                    <tr>
                      <td colSpan={editTimeline ? 4 : 3} className="py-20 text-center">
                        <Clock size={40} className="text-slate-100 mx-auto mb-3" />
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-wide">Belum ada timeline</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jadwal;
