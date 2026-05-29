'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import Icon
import {
  Users, CheckCircle, Clock, Plus, UserPlus, Trash2, LayoutGrid, ChevronRight, ChevronLeft, Loader2, RotateCcw
} from 'lucide-react';

// Import Komponen
import NavbarAdmin from '../navigasi/NavbarAdmin';
import SidebarAdmin from '../navigasi/SidebarAdmin';
import TambahAkun from './TambahAkun';
import Konfirmasi from '../../element/Konfirmasi';
import toast from 'react-hot-toast';

// Import Utility
import { fetchDenganToken } from '../../../lib/apiClient';

// Komponen Dashboard Admin
const DashboardAdmin = () => {
  const router = useRouter();
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useState(true);
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);
  const [apakahModalTambahTerbuka, setApakahModalTambahTerbuka] = useState(false);
  const [apakahModalHapusTerbuka, setApakahModalHapusTerbuka] = useState(false);
  const [dataAkunHapus, setDataAkunHapus] = useState(null);
  const [halamanAktif, setHalamanAktif] = useState(1);
  const [loading, setLoading] = useState(true);

  // Data Real dari API
  const [statistikUtama, setStatistikUtama] = useState({ total: 0, success: 0, pending: 0, refund: 0 });
  const [statistikLomba, setStatistikLomba] = useState([]);
  const [daftarAkun, setDaftarAkun] = useState([]);

  // Fungsi Mengambil Data Dashboard menggunakan fetchDenganToken
  const ambilDataDashboard = async () => {
    setLoading(true);
    let sudahAdaError = false;
    try {
      const resStats = await fetchDenganToken('/api/admin/dashboard');

      // Statistik Lomba
      if (resStats.ok) {
        const data = await resStats.json();
        setStatistikUtama(data.statistikUtama);
        const formatStatistik = (data.statistikLomba || []).map(lomba => ({
          nama: lomba.nama,
          jumlah: lomba.jumlah || 0,
          max: 50
        }));
        setStatistikLomba(formatStatistik);
      }
      // Jika Gagal
      else {
        const errorData = await resStats.json().catch(() => ({}));
        toast.error(errorData.pesan || "Gagal Memuat Statistik");
        sudahAdaError = true;
      }

      // Daftar Akun menggunakan fetchDenganToken
      const resUsers = await fetchDenganToken('/api/admin/users');
      if (resUsers.ok) {
        const data = await resUsers.json();
        setDaftarAkun(data);
      } else if (!sudahAdaError) {
        const errorData = await resUsers.json().catch(() => ({}));
        toast.error(errorData.pesan || "Gagal Memuat Daftar Akun");
      }

      // Jika Error Server
    } catch (err) {
      console.error("Gagal ambil data dashboard:", err);
      if (!sudahAdaError) toast.error("Gagal Menghubungi Server Database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ambilDataDashboard(); }, []);

  // Fungsi Hapus Akun menggunakan fetchDenganToken
  const tanganiHapusAkun = async () => {
    try {
      const res = await fetchDenganToken('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dataAkunHapus.id })
      });

      // Jika Berhasil
      if (res.ok) {
        toast.success("Akun Berhasil Dihapus");
        ambilDataDashboard();
        setApakahModalHapusTerbuka(false);
      }
      // Jika Gagal
      else {
        const err = await res.json();
        toast.error(err.pesan || "Gagal Menghapus Akun");
      }

      // Jika Error Server
    } catch (err) { toast.error("Kesalahan Sistem"); }
  };

  // Logika Paginasi Daftar Akun
  const itemPerHalaman = 10;
  const totalHalaman = Math.ceil(daftarAkun.length / itemPerHalaman);
  const indeksTerakhir = halamanAktif * itemPerHalaman;
  const indeksAwal = indeksTerakhir - itemPerHalaman;
  const akunTampil = daftarAkun.slice(indeksAwal, indeksTerakhir);

  // Kartu Statistik Utama
  const statistikCards = [
    { id: 1, judul: "TOTAL PENDAFTAR", jumlah: statistikUtama.total, ikon: <Users size={24} />, warna: "text-blue-500", bgIcon: "bg-blue-50", borderColor: "border-b-blue-400", link: null },
    { id: 2, judul: "SUDAH TERVERIFIKASI", jumlah: statistikUtama.success, ikon: <CheckCircle size={24} />, warna: "text-emerald-500", bgIcon: "bg-emerald-50", borderColor: "border-b-emerald-400", link: null },
    { id: 3, judul: "BELUM TERVERIFIKASI", jumlah: statistikUtama.pending, ikon: <Clock size={24} />, warna: "text-amber-500", bgIcon: "bg-amber-50", borderColor: "border-b-amber-400", link: "/admin/verifikasi" },
    { id: 4, judul: "TOTAL REFUND", jumlah: statistikUtama.refund, ikon: <RotateCcw size={24} />, warna: "text-rose-500", bgIcon: "bg-rose-50", borderColor: "border-b-rose-400", link: "/admin/refund" },
  ];

  return (
    // Halaman Bagian Dashboard
    <div className="min-h-screen bg-[#F8FAFC] font-montserrat flex flex-col overflow-hidden">
      <NavbarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} setApakahSidebarTerbuka={setApakahSidebarTerbuka} apakahProfilTerbuka={apakahProfilTerbuka} setApakahProfilTerbuka={setApakahProfilTerbuka} />
      <div className="flex flex-1 pt-14">
        <SidebarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} />

        {/* Container Isi Konten */}
        <main className={`flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-6 scrollbar-hide transition-all duration-500 ${apakahSidebarTerbuka ? 'md:ml-56' : 'ml-0'}`}>
          <div className="max-w-[1400px] mx-auto space-y-8">

            {/* Container Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statistikCards.map((item) => (
                // Container Kotak
                <div key={item.id} onClick={() => item.link && router.push(item.link)} className={`bg-white py-4 px-4 h-24 rounded-2xl shadow-sm border border-slate-100 border-b-4 ${item.borderColor} relative group hover:shadow-md transition-all duration-300 ${item.link ? 'cursor-pointer active:scale-95' : ''}`}>
                  <div className="flex items-center gap-3 h-full">
                    {/* Icon */}
                    <div className={`p-3 ${item.bgIcon} rounded-2xl ${item.warna} transition-transform group-hover:scale-110 duration-300`}>
                      {item.ikon}
                    </div>

                    {/* Teks Judul dan Jumlah */}
                    <div className="flex flex-col justify-between h-full">
                      <p className="block text-[12px] font-bold text-black tracking-normal whitespace-nowrap overflow-hidden">{item.judul}</p>
                      <h3 className="text-4xl font-black text-[#0B255D] leading-tight">{loading ? "..." : item.jumlah}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Container Grafik dan Daftar Akun */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              {/* Container Daftar Akun */}
              <div className="xl:col-span-8 flex flex-col">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">

                  {/* Container Judul dan Tombol Tambah Akun */}
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    {/* Judul */}
                    <h3 className="font-black text-[#0B255D] flex items-center gap-2 uppercase tracking-tight text-sm">
                      <UserPlus size={18} className="text-[#16B9FF]" /> Daftar Akun Pengguna
                    </h3>

                    {/* Tombol */}
                    <button onClick={() => setApakahModalTambahTerbuka(true)} className="bg-[#0B255D] hover:bg-blue-500 active:bg-[#0B255D] text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-wide transition-all flex items-center gap-2 shadow-lg shadow-[#0B255D]/10 uppercase">
                      <Plus size={14} /> Tambah Akun
                    </button>
                  </div>

                  {/* Container Tabel */}
                  <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                      {/* Header Tabel */}
                      <thead>
                        <tr className="bg-[#0B255D] text-white text-[10px] font-black uppercase tracking-wide">
                          <th className="px-8 py-4 border-r border-white/5 font-black text-left">Nama Lengkap</th>
                          <th className="px-6 py-4 border-r border-white/5 font-black text-left">Email</th>
                          <th className="pr-11 py-4 font-black uppercase tracking-wide text-right">Aksi</th>
                        </tr>
                      </thead>

                      {/* Body Tabel */}
                      <tbody className="divide-y divide-slate-100">
                        {loading ? (
                          <tr><td colSpan="3" className="py-20"><div className="flex flex-col items-center justify-center gap-3"><Loader2 size={30} className="text-[#16B9FF] animate-spin" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Memuat Data...</p></div></td></tr>
                        ) : akunTampil.length > 0 ? (
                          akunTampil.map((akun) => (
                            <tr key={akun.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-3"><div className="text-[11px] font-medium text-slate-900">{akun.nama}</div></td>
                              <td className="px-6 py-3 text-[11px] font-medium text-slate-700">{akun.email}</td>
                              <td className="px-8 py-3"><div className="flex justify-end"><button onClick={() => { setDataAkunHapus(akun); setApakahModalHapusTerbuka(true); }} className="flex items-center gap-2 px-3 py-1 text-red-500 hover:text-red-700 transition-all font-bold"><Trash2 size={16} /><span className="text-[11px] font-medium">Hapus</span></button></div></td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="px-8 py-10 text-center text-slate-400 font-bold uppercase text-[11px]">Data Belum Ada</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Container Tombol Pagination */}
                  <div className="mt-auto px-8 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    {/* Deskripsi */}
                    <p className="text-[11px] font-medium text-slate-600">Menampilkan {akunTampil.length} dari {daftarAkun.length} akun</p>

                    {/* Tombol Pagination */}
                    <div className="flex items-center gap-3">
                      <button onClick={() => setHalamanAktif(prev => Math.max(prev - 1, 1))} disabled={halamanAktif === 1} className="p-2 rounded-lg border-2 border-slate-400 text-slate-900 hover:border-[#16B9FF] hover:text-[#16B9FF] disabled:opacity-20 transition-all bg-white shadow-sm"><ChevronLeft size={16} strokeWidth={3} /></button>
                      <button onClick={() => setHalamanAktif(prev => Math.min(prev + 1, totalHalaman))} disabled={halamanAktif === totalHalaman || totalHalaman === 0} className="p-2 rounded-lg border-2 border-slate-400 text-slate-900 hover:border-[#16B9FF] hover:text-[#16B9FF] disabled:opacity-20 transition-all bg-white shadow-sm"><ChevronRight size={16} strokeWidth={3} /></button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Container Grafik Pendaftar Tiap Lomba */}
              <div className="xl:col-span-4 flex flex-col">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full">

                  {/* Judul */}
                  <div className="flex items-center justify-between mb-8"><h3 className="font-black text-[#0B255D] flex items-center gap-2 uppercase tracking-tight text-sm"><LayoutGrid size={18} className="text-[#16B9FF]" /> Pendaftar Tiap Lomba</h3></div>

                  {/* Container Statistik */}
                  <div className="space-y-6">
                    {statistikLomba.map((lomba, idx) => (
                      <div key={idx} className="space-y-1.5">

                        {/* Nama Lomba */}
                        <p className="text-[11px] font-medium text-slate-600 tracking-wide">
                          {lomba.nama.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(' ')}
                        </p>

                        {/* Jumlah Pendaftar */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#16B9FF] transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(22,185,255,0.4)]" style={{ width: `${(lomba.jumlah / lomba.max) * 100}%` }}></div></div>
                          <p className="text-[11px] font-medium text-slate-600 min-w-[20px] text-right">{lomba.jumlah}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {apakahModalTambahTerbuka && <TambahAkun setApakahModalTambahTerbuka={setApakahModalTambahTerbuka} onSuccess={ambilDataDashboard} />}
      <Konfirmasi apakahTerbuka={apakahModalHapusTerbuka} setApakahTerbuka={setApakahModalHapusTerbuka} dataNama={dataAkunHapus?.nama} onConfirm={tanganiHapusAkun} tipe="akun" />
    </div>
  );
};

export default DashboardAdmin;
