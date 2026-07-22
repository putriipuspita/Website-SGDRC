'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// Komponen Form Pendaftaran Lomba
import FormPendaftaran from './FormPendaftaran';

// Komponen Icon Pada Daftar Lomba
import {
  Tag,
  Calendar,
  Users,
  Layers
} from 'lucide-react';

// Komponen Navigasi
import Navbar from './navigasi/Navbar';
import Sidebar from './navigasi/Sidebar';

// Import Utility
import useSidebar from '../../hooks/useSidebar';

// Halaman Utama Dashboard Peserta
const DashboardPeserta = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lombaTerpilih, setLombaTerpilih] = useState(null);
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);
  const [daftarLomba, setDaftarLomba] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi Mengatur Buka Tutup Sidebar (menggunakan custom hook)
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useSidebar();

  // Fungsi Mengambil Data Lomba Dari Database
  const ambilLomba = async (tampilkanLoading = false) => {
    try {
      if (tampilkanLoading) setLoading(true);
      const res = await fetch('/api/peserta/lomba');
      if (res.ok) {
        const data = await res.json();
        setDaftarLomba(Array.isArray(data) ? data : []);
      } else {
        setError("Gagal memuat data lomba");
      }
    } catch (err) {
      console.error("Gagal ambil lomba:", err);
      setError("Koneksi database bermasalah");
    } finally {
      setLoading(false);
    }
  };

  // Mengambil Data Saat Halaman Dibuka Pertama Kali
  useEffect(() => {
    Promise.resolve().then(() => {
      ambilLomba(true);
    });

    const tanganiFokus = () => {
      ambilLomba(false);
    };

    window.addEventListener('focus', tanganiFokus);
    return () => window.removeEventListener('focus', tanganiFokus);
  }, []);

  // // Menyesuaikan Lomba Yang Dipilih Berdasarkan URL
  useEffect(() => {
    const teksIdLomba = searchParams.get('lombaId');
    if (teksIdLomba && daftarLomba.length > 0) {
      const idLomba = parseInt(teksIdLomba);
      const ditemukan = daftarLomba.find(l => l.id === idLomba);
      // Jika Lomba Ditemukan
      if (ditemukan) {
        Promise.resolve().then(() => {
          setLombaTerpilih(ditemukan);
        });
      }

      // Jika Lomba Tidak Ditemukan
    } else {
      Promise.resolve().then(() => {
        setLombaTerpilih(null);
      });
    }
  }, [searchParams, daftarLomba]);

  // Fungsi saat tombol daftar diklik
  const tanganiKlikDaftar = (lomba) => {
    router.push(`${pathname}?lombaId=${lomba.id}`);
  };

  // Fungsi untuk kembali ke daftar lomba
  const kembaliKeAwal = () => {
    router.push(pathname);
  };

  return (
    // Bagian Dashboard Halaman Peserta
    <div className="h-screen bg-slate-50 text-slate-800 font-montserrat flex flex-col overflow-hidden">

      {/* Navigasi Bar Atas */}
      <Navbar
        apakahSidebarTerbuka={apakahSidebarTerbuka}
        setApakahSidebarTerbuka={setApakahSidebarTerbuka}
        apakahProfilTerbuka={apakahProfilTerbuka}
        setApakahProfilTerbuka={setApakahProfilTerbuka}
        tampilkanHamburger={!lombaTerpilih}
        apakahBeku={!!lombaTerpilih}
      />

      {/* Garis Pembatas Horizontal*/}
      <div className="w-full h-[1px] bg-[#16B9FF] shadow-[0_2px_8px_rgba(22,185,255,0.1)] relative z-[70]"></div>

      {/* Container Dashboard */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar Sembunyi Saat Form Muncul */}
        {!lombaTerpilih && <Sidebar apakahSidebarTerbuka={apakahSidebarTerbuka} />}

        {/* Container Isi Dashboard*/}
        <div className="flex-1 bg-slate-50 overflow-y-auto peserta-scrollbar border-l border-solid border-[#16B9FF] shadow-[-2px_0_8px_rgba(22,185,255,0.1)] flex flex-col px-6 md:px-10 py-8 relative z-20">
          <div className="w-full">

            {/* Judul Dashboard */}
            {!lombaTerpilih && (
              <div className="mb-10 text-left border-l-4 border-[#E40011] pl-6 animate-in slide-in-from-left duration-700">
                <h1 className="text-xl font-black mb-1 tracking-normal text-slate-950 uppercase leading-relaxed md:leading-tight">Pilih Lomba yang Ingin Diikuti</h1>
                <p className="text-slate-500 text-[9.5px] font-bold tracking-normal uppercase leading-relaxed md:leading-normal">Portal Pendaftaran SGDRC {new Date().getFullYear()}</p>
              </div>
            )}

            {/* Tampilan Loading*/}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-10 h-10 border-4 border-[#16B9FF] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Memuat Daftar Lomba...</p>
              </div>
            ) :
              // Tampilan Error
              error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-500 font-bold text-xs uppercase tracking-wider mb-4">
                    {error}
                  </div>
                  <button onClick={() => window.location.reload()} className="text-[10px] font-black text-[#16B9FF] underline uppercase">Coba Lagi</button>
                </div>
              ) :

                // Tampilan Form Pendaftaran
                lombaTerpilih ? (
                  <FormPendaftaran
                    lomba={lombaTerpilih}
                    kembali={kembaliKeAwal}
                  />
                ) : (

                  /* Container Kartu Lomba */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:landscape:grid-cols-4 gap-6 gap-y-14 pb-32">
                    {daftarLomba.map((lomba) => (

                      // Kartu Lomba
                      <div key={lomba.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.05),0_0_20px_rgba(22,185,255,0.06)] flex flex-col border border-slate-200/60 group w-full font-montserrat">

                        {/* Gambar Lomba */}
                        <div className="w-full md:h-40 relative border-b border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                          <img
                            src={lomba.gambar || null}
                            alt={lomba.nama}
                            className="w-full h-auto md:h-full md:object-fill block group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>

                        {/* Judul Lomba */}
                        <div className="bg-[#1E3A5F] py-1 px-4 min-h-[38px] flex items-center justify-center border-b border-white/10">
                          <h4 className="text-[11.8px] md:text-[11px] 2xl:text-[11.8px] font-black text-white text-center tracking-wider leading-tight uppercase">
                            {lomba.nama}
                          </h4>
                        </div>

                        {/* Container Detail Informasi */}
                        <div className="bg-white p-2.5 flex-1 text-slate-800">
                          <div className="space-y-1.5">

                            {/* Jenjang */}
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-blue-50 rounded text-[#1E3A5F]">
                                <Layers size={12} />
                              </div>
                              <span className="text-[10.8px] md:text-[10px] 2xl:text-[10.8px] font-black uppercase tracking-tight text-slate-950">Jenjang {lomba.jenjang}</span>
                            </div>

                            {/* Harga Pendaftaran */}
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-green-50 rounded text-green-600">
                                <Tag size={12} />
                              </div>
                              <span className="text-[11.8px] md:text-[11px] 2xl:text-[11.8px] font-bold tracking-tight text-slate-950">{lomba.harga}</span>
                            </div>

                            {/* Jadwal Pelaksanaan */}
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-orange-50 rounded text-orange-600">
                                <Calendar size={12} />
                              </div>
                              <span className="text-[11.8px] md:text-[11px] 2xl:text-[11.8px] font-bold text-slate-950">{lomba.tanggal}</span>
                            </div>

                            {/* Jumlah Tim */}
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-purple-50 rounded text-purple-600">
                                <Users size={12} />
                              </div>
                              <span className="text-[11.8px] md:text-[11px] 2xl:text-[11.8px] font-bold text-slate-950">{lomba.tim}</span>
                            </div>
                          </div>

                          {/* Tombol Aksi */}
                          <button
                            onClick={() => lomba.status !== 'Close' && tanganiKlikDaftar(lomba)}
                            disabled={lomba.status === 'Close'}
                            className={`mt-4 w-full py-2 font-black text-[11.8px] md:text-[11px] 2xl:text-[11.8px] tracking-wider rounded-lg transition-all uppercase active:scale-95 ${lomba.status === 'Close'
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-[#E40011] hover:bg-[#c3000f] text-white'
                              }`}
                          >
                            {lomba.status === 'Close' ? 'PENDAFTARAN DITUTUP' : 'DAFTAR SEKARANG'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPeserta;
