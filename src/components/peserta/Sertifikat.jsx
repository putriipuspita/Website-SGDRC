'use client';
// Import Icon, Navigasi, Navigasi dan Tampilan Data Kosong
import React, { useState, useEffect } from 'react';
import { Award, Download, ShieldCheck, Trophy, Loader2, Search, Filter, ChevronDown } from 'lucide-react';
import Navbar from './navigasi/Navbar';
import Sidebar from './navigasi/Sidebar';
import StateKosong from '../element/StateKosong';

// Import Utility
import useSidebar from '../../hooks/useSidebar';
import { formatJudul } from '../../lib/formatHelper';
import { unduhSertifikat } from '../../lib/pdfHelper';
import { fetchDenganToken } from '@/lib/apiClient';

// Komponen Utama Halaman Sertifikat
const Sertifikat = () => {
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);
  // Fungsi Mengatur Sidebar (menggunakan custom hook)
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useSidebar();

  // State Loading dan Simpan Data
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [dataPendaftar, setDataPendaftar] = useState([]);

  // State untuk Filter dan Pencarian
  const [kataKunci, setKataKunci] = useState('');
  const [lombaFilter, setLombaFilter] = useState('SEMUA');
  const [jenisFilter, setJenisFilter] = useState('SEMUA');
  const [daftarLomba, setDaftarLomba] = useState([]);

  // Ambil Data Pendaftaran dari Database
  useEffect(() => {
    const ambilData = async () => {
      try {
        const token = localStorage.getItem('token_sgdrc');

        let dataLombaTemp = [];
        try {
          // Ambil Data Lomba
          const resL = await fetch('/api/peserta/lomba');
          if (resL.ok) {
            dataLombaTemp = await resL.json();
            setDaftarLomba(dataLombaTemp);
          }
        } catch (errL) {
          console.error("Gagal mengambil info lomba:", errL);
        }

        // Ambil Data Pendaftaran
        const res = await fetchDenganToken('/api/peserta/pendaftaran');

        // Jika Berhasil
        if (res.ok) {
          const data = await res.json();
          const kategoriOrder = dataLombaTemp.map(l => l.nama.toUpperCase());

          let dataTerurut = data.filter(d => d.status_pendaftaran === 'success');
          dataTerurut.sort((a, b) => {
            // Cari Index Kategori Lomba
            const idxA = kategoriOrder.indexOf((a.nama_lomba || "").toUpperCase());
            const idxB = kategoriOrder.indexOf((b.nama_lomba || "").toUpperCase());

            // Kondisi
            if (idxA !== -1 && idxB !== -1) {
              if (idxA !== idxB) return idxA - idxB;
            } else if (idxA !== -1) {
              return -1;
            } else if (idxB !== -1) {
              return 1;
            }
            return (a.nama_tim || "").localeCompare(b.nama_tim || "");
          });

          // Penomoran Sertifikat
          let currentGlobalPesertaIndex = 0;
          let currentGlobalJuaraIndex = 0;

          // Mapping Seluruh Data
          dataTerurut = dataTerurut.map(tim => {
            const startIdxPeserta = currentGlobalPesertaIndex;
            const startIdxJuara = currentGlobalJuaraIndex;

            // Ambil Seluruh Data Nama Peserta
            const members = [tim.nama_peserta1, tim.nama_peserta2, tim.nama_peserta3].filter(n => n && n.trim() !== "" && n.trim() !== "-");
            currentGlobalPesertaIndex += members.length;

            // Jika Ada Peringkat
            if (tim.peringkat) {
              currentGlobalJuaraIndex += members.length;
            }

            return {
              ...tim,
              global_start_idx_peserta: startIdxPeserta,
              global_start_idx_juara: startIdxJuara
            };
          });

          setDataPendaftar(dataTerurut);
        }
      } catch (err) {
        console.error("Gagal menarik data sertifikat:", err);
      } finally {
        setSedangMemuat(false);
      }
    };
    ambilData();
  }, []);

  // Membuat List Sertifikat
  const { peserta, juara } = dataPendaftar.reduce((acc, item) => {
    // Skip Jika Sertifikat Belum Siap
    if (Number(item.is_sertifikat_siap) !== 1) return acc;

    // Ambil Seluruh Data
    const listNama = [item.nama_peserta1, item.nama_peserta2, item.nama_peserta3].filter(n => n && n.trim() !== "" && n.trim() !== "-");
    listNama.forEach((nama, indeks) => {
      // Masukkan ke List Peserta
      acc.peserta.push({
        id: `peserta-${item.id}-${indeks}`,
        nama: formatJudul(nama),
        lomba: item.nama_lomba,
        tim: item.nama_tim,
        instansi: item.asal_instansi,
        jenis: 'PESERTA',
        peringkat: null,
        index: indeks,
        global_start_idx_peserta: item.global_start_idx_peserta,
        global_start_idx_juara: item.global_start_idx_juara,
        punya_peringkat: !!item.peringkat
      });

      // Masukkan ke List Juara
      if (item.peringkat) {
        acc.juara.push({
          id: `juara-${item.id}-${indeks}`,
          nama: formatJudul(nama),
          lomba: item.nama_lomba,
          tim: item.nama_tim,
          instansi: item.asal_instansi,
          jenis: 'JUARA',
          peringkat: item.peringkat,
          index: indeks,
          global_start_idx_peserta: item.global_start_idx_peserta,
          global_start_idx_juara: item.global_start_idx_juara,
          punya_peringkat: true
        });
      }
    });
    return acc;
  }, { peserta: [], juara: [] });

  // Gabungkan List Sertifikat (Peserta - Juara)
  const daftarSertifikat = [...peserta, ...juara];

  // Proses Filter & Pencarian
  const sertifikatTersaring = daftarSertifikat.filter(item => {
    const cocokSearch =
      item.nama.toLowerCase().includes(kataKunci.toLowerCase()) ||
      (item.tim || '').toLowerCase().includes(kataKunci.toLowerCase()) ||
      item.instansi.toLowerCase().includes(kataKunci.toLowerCase());

    const cocokLomba = lombaFilter === 'SEMUA' || item.lomba.toUpperCase() === lombaFilter.toUpperCase();
    const cocokJenis = jenisFilter === 'SEMUA' || item.jenis === jenisFilter;

    return cocokSearch && cocokLomba && cocokJenis;
  });

  // Fungsi Unduh Sertifikat (menggunakan utility pdfHelper)
  const tanganiUnduh = async (item) => {
    try {
      await unduhSertifikat(item);
    } catch (err) {
      console.error("Gagal Mengunduh Sertifikat:", err);
    }
  };

  return (
    // Halaman Sertifikat
    <div className="h-screen bg-slate-50 text-slate-800 font-montserrat flex flex-col overflow-hidden">
      {/* Navigasi */}
      <Navbar
        apakahSidebarTerbuka={apakahSidebarTerbuka}
        setApakahSidebarTerbuka={setApakahSidebarTerbuka}
        apakahProfilTerbuka={apakahProfilTerbuka}
        setApakahProfilTerbuka={setApakahProfilTerbuka}
      />

      {/* Garis Pembatas Horizontal */}
      <div className="w-full h-[1px] bg-[#16B9FF] shadow-[0_2px_8px_rgba(22,185,255,0.1)] relative z-[70]"></div>

      {/* Container Sertifikat */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar apakahSidebarTerbuka={apakahSidebarTerbuka} />

        {/* Container Konten Sertifikat */}
        <div className="flex-1 bg-slate-50 overflow-y-auto peserta-scrollbar px-6 md:px-10 py-8 flex flex-col border-l border-solid border-[#16B9FF] shadow-[-2px_0_8px_rgba(22,185,255,0.1)] relative z-20">
          <div className="w-full flex-1 flex flex-col">
            {/* Judul, Deskripsi & Filter Controls*/}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6 animate-in slide-in-from-left duration-700">
              <div className="text-left border-l-4 border-[#E40011] pl-6">
                <h1 className="text-xl font-black mb-1 tracking-normal text-slate-950 uppercase leading-relaxed md:leading-tight">Sertifikat Elektronik</h1>
                <p className="text-slate-500 text-[9.5px] font-bold tracking-normal uppercase leading-relaxed">Pencapaian Resmi SGDRC {new Date().getFullYear()}</p>
              </div>

              {/* Container Filter & Search */}
              {!sedangMemuat && daftarSertifikat.length > 0 && (
                <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center w-full xl:w-auto animate-in fade-in duration-300">
                  {/* Baris 1: Search & Filter Cabang Lomba (Fleksibel Sama Panjang di HP & Tablet) */}
                  <div className="flex flex-row gap-2 sm:gap-3 flex-1 xl:flex-initial w-full xl:w-auto">
                    {/* Input Kolom Pencarian */}
                    <div className="relative group flex-1 w-1/2 min-w-0 xl:min-w-[220px] xl:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#16B9FF] transition-colors" size={14} />
                      <input
                        type="text"
                        placeholder="Cari Nama, Tim..."
                        value={kataKunci}
                        onChange={(e) => setKataKunci(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[12px] md:text-[12px] lg:text-[11px] font-bold text-slate-950 placeholder:text-slate-400 shadow-sm"
                      />
                    </div>

                    {/* Filter Kategori Lomba */}
                    <div className="relative flex-1 w-1/2 min-w-0 xl:min-w-[190px] xl:w-auto">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                      <select
                        value={lombaFilter}
                        onChange={(e) => setLombaFilter(e.target.value)}
                        className="w-full pl-9 pr-7 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[12px] md:text-[12px] lg:text-[11px] font-bold text-slate-950 appearance-none shadow-sm capitalize"
                      >
                        <option value="SEMUA">Semua Cabang Lomba</option>
                        {daftarLomba.map(lomba => (
                          <option key={lomba.id} value={lomba.nama.toUpperCase()}>{formatJudul(lomba.nama)}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                    </div>
                  </div>

                  {/* Filter Jenis Sertifikat (Peserta / Juara) - Turun ke Baris 2 di HP & Tablet */}
                  <div className="flex bg-white p-0.5 rounded-xl border-2 border-slate-200 shadow-sm w-full xl:min-w-[150px] xl:w-auto">
                    {[
                      { id: 'SEMUA', nama: 'Semua' },
                      { id: 'PESERTA', nama: 'Peserta' },
                      { id: 'JUARA', nama: 'Juara' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setJenisFilter(opt.id)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[10.5px] font-bold transition-all ${jenisFilter === opt.id
                          ? 'bg-[#16B9FF] text-white shadow-sm'
                          : 'text-slate-950 hover:bg-slate-50'
                          }`}
                      >
                        {opt.nama}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tampilan Loading */}
            {sedangMemuat ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-10 h-10 text-[#16B9FF] animate-spin mb-4 mx-auto" />
                <p className="text-slate-400 font-bold tracking-normal text-[10px]">Menyiapkan Sertifikat...</p>
              </div>
            ) :

              // Tampilan Jika Data Kosong
              daftarSertifikat.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-12">
                  <StateKosong
                    Ikon={Award}
                    judul="Belum Ada Sertifikat"
                    deskripsi="Sertifikat akan diterbitkan secara otomatis oleh admin setelah seluruh rangkaian acara selesai."
                    className="flex flex-col items-center justify-center p-4 text-center"
                  />
                </div>
              ) : (

                <div className="flex-1 flex flex-col">

                  {/* Menampilkan Data Sertifikat */}
                  {sertifikatTersaring.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-12">
                      <StateKosong
                        Ikon={Award}
                        judul="Sertifikat Tidak Ditemukan"
                        deskripsi="Tidak ada sertifikat yang cocok dengan pencarian atau filter."
                        className="flex flex-col items-center justify-center p-4 text-center"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 pb-32">
                      {sertifikatTersaring.map((item) => (
                        <div key={item.id} className="relative group">
                          {/* Container Kotak List */}
                          <div className={`relative bg-gradient-to-br from-white via-white ${item.jenis === 'JUARA' ? 'to-amber-50 border-amber-200' : 'to-blue-50 border-[#16B9FF]/30'} border rounded-xl p-5 flex flex-col h-full overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.05),0_0_15px_rgba(22,185,255,0.15)] transition-all`}>
                            {/* Efek Pendaran Cahaya */}
                            <div className={`absolute top-0 left-0 w-full h-full ${item.jenis === 'JUARA' ? 'bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.08),transparent_60%)]' : 'bg-[radial-gradient(circle_at_top_left,rgba(22,185,255,0.08),transparent_60%)]'} pointer-events-none`}></div>

                            {/* Logo Background */}
                            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                              <ShieldCheck size={110} className={`${item.jenis === 'JUARA' ? 'text-amber-500' : 'text-[#16B9FF]'} -mr-8 -mt-8 rotate-12`} />
                            </div>

                            {/* Container Badge Jenis Sertifikat */}
                            <div className="flex justify-between items-start mb-4 relative z-10">

                              {/* Container Jenis Sertifikat dan Jenis Lomba */}
                              <div className="flex flex-col">
                                <span className={`px-2 py-0.5 ${item.jenis === 'JUARA' ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-[#16B9FF]/20 border-[#16B9FF]/40 text-[#16B9FF]'} border rounded-md text-[7px] font-black uppercase tracking-wider mb-3 w-fit`}>
                                  {item.jenis === 'JUARA'
                                    ? `E-CERTIFICATE ${item.peringkat.toUpperCase().includes('JUARA') ? item.peringkat.toUpperCase() : `JUARA ${item.peringkat.toUpperCase()}`}`
                                    : 'E-CERTIFICATE'}
                                </span>
                                <h4 className={`text-[11px] font-black ${item.jenis === 'JUARA' ? 'text-amber-700' : 'text-[#16B9FF]'} uppercase tracking-wider leading-tight`}>{item.lomba}</h4>
                              </div>

                              {/* Icon */}
                              <div className={`p-1.5 ${item.jenis === 'JUARA' ? 'bg-amber-100 border-amber-300' : 'bg-[#16B9FF]/10 border-[#16B9FF]/30'} border rounded-lg`}>
                                {item.jenis === 'JUARA' ? <Trophy size={16} className="text-amber-600" /> : <Award size={16} className="text-[#16B9FF]" />}
                              </div>
                            </div>

                            {/* Container Informasi Sertifikat */}
                            <div className="space-y-2 mb-6 relative z-10">
                              {/* Nama */}
                              <div>
                                <p className="text-[7px] font-bold text-slate-950 uppercase tracking-normal mb-1">Diberikan Kepada</p>
                                <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight leading-tight">
                                  {item.nama}
                                </h3>
                              </div>

                              {/* Container Tim dan Instansi */}
                              <div className="grid grid-cols-2 gap-4 pt-1">
                                {/* Tim */}
                                <div>
                                  <p className="text-[7px] font-bold text-slate-950 uppercase tracking-normal mb-1">Tim</p>
                                  <p className={`text-[11px] font-bold ${item.jenis === 'JUARA' ? 'text-amber-700' : 'text-[#16B9FF]'} truncate`}>{item.tim || '-'}</p>
                                </div>

                                {/* Instansi */}
                                <div>
                                  <p className="text-[7px] font-bold text-slate-950 uppercase tracking-normal mb-1">Instansi</p>
                                  <p className="text-[11px] font-bold text-slate-950 truncate">{item.instansi}</p>
                                </div>
                              </div>
                            </div>

                            {/* Tombol Unduh Sertifikat */}
                            <button
                              onClick={() => tanganiUnduh(item)}
                              className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 ${item.jenis === 'JUARA' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#16B9FF] hover:bg-[#1299d4]'} text-white rounded-lg font-black text-[9px] uppercase tracking-wider transition-all active:scale-95`}
                            >
                              <Download size={14} className="text-white" />
                              Unduh Sertifikat {item.jenis === 'JUARA' ? 'Juara' : 'Peserta'}
                            </button>

                            {/* Kilauan animasi (Sheen) */}
                            <style dangerouslySetInnerHTML={{
                              __html: `
                            @keyframes sheen {
                              0% { left: -150%; }
                              100% { left: 150%; }
                            }
                          `}} />
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-25deg] group-hover:animate-[sheen_2s_infinite]"></div>
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-[#16B9FF]/10 to-transparent skew-x-[-25deg] group-hover:animate-[sheen_2s_infinite] delay-100"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sertifikat;
