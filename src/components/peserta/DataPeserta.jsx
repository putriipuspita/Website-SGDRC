'use client';
import React, { useState, useEffect } from 'react';
// Import Icon
import {
  Search, Filter, Download, CheckCircle2, UserCircle, ChevronDown, Plus, Minus, Database, Loader2, Eye
} from 'lucide-react';

// Import Link dan useRouter dari React
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Impot Navbar, Sidebar dan Bukti Pendaftaran
import Navbar from './navigasi/Navbar';
import Sidebar from './navigasi/Sidebar';
import KwitansiPendaftaran from './bukti-pendaftaran/RegistrationReceipt';
import StateKosong from '../element/StateKosong';

// Import Utility
import useSidebar from '../../hooks/useSidebar';
import { formatJudul } from '../../lib/formatHelper';
import { unduhKwitansi } from '../../lib/pdfHelper';

// Fungsi Mengatur Warna Status Pendaftaran
const ambilWarnaStatus = (status) => {
  switch (status) {
    case 'TERVERIFIKASI':
      return 'text-emerald-500';
    case 'DITOLAK':
      return 'text-rose-500';
    case 'REFUNDED':
      return 'text-orange-500';
    default:
      return 'text-amber-500';
  }
};

// Fungsi untuk Menampilkan Detail Peserta
const BarisDetailPeserta = ({ label, value }) => (
  <div className="flex py-2 border-b border-slate-50 last:border-0 items-start">

    {/* Label dan Titik Dua */}
    <div className="w-[100px] md:w-[120px] flex-shrink-0 flex justify-between">
      <span className="text-[11.5px] font-bold text-slate-400 leading-relaxed">{label}</span>
      <span className="text-[11.5px] font-bold text-slate-400 mr-2 md:mr-4 leading-relaxed">:</span>
    </div>

    {/* Nilai */}
    <div className="flex-1 text-left">
      <span className="text-[11.5px] font-bold leading-relaxed block text-slate-700">{value || "-"}</span>
    </div>
  </div>
);

// Fungsi Lihat Bukti Refund
const GaleriBuktiRefund = ({ buktiRefund }) => (
  <div className="w-full">
    <div className="space-y-2 text-left max-w-md">
      <label className="text-[10px] font-black text-orange-400 uppercase tracking-wider block ml-1">Bukti Transfer Refund (Panitia)</label>

      {/* Container Gambar Bukti Refund dan Tombol Lihat */}
      <div className="relative group cursor-pointer" onClick={() => window.open(buktiRefund, '_blank')}>
        <img src={buktiRefund} className="w-full h-32 md:h-40 object-cover rounded-xl md:rounded-2xl border-2 border-orange-100 group-hover:opacity-80 transition-all" alt="Bukti Refund" />

        {/* Tombol Lihat */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-orange-500/20 rounded-xl md:rounded-2xl">
          <span className="bg-white px-3 py-1 rounded-full text-[9px] font-black uppercase text-orange-600">Lihat</span>
        </div>

      </div>
    </div>
  </div>
);

// Halaman Data Pendaftaran Peserta
const DataPeserta = () => {
  const navigasi = useRouter();

  // State untuk Filter, dan Pencarian
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);
  const [kataKunciCari, setKataKunciCari] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [lombaFilter, setLombaFilter] = useState('Semua');
  const [barisTerbuka, setBarisTerbuka] = useState(null);
  const [isHp, setIsHp] = useState(false);
  const [sedangUnduh, setSedangUnduh] = useState(null);
  const [pengaturan, setPengaturan] = useState({});

  // Fungsi Deteksi Ukuran Layar
  useEffect(() => {
    const cekLayar = () => setIsHp(window.innerWidth < 768);
    cekLayar();
    window.addEventListener('resize', cekLayar);
    return () => window.removeEventListener('resize', cekLayar);
  }, []);

  // Fungsi Mengatur Sidebar (menggunakan custom hook)
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useSidebar();

  // State Untuk Daftar Lomba Dari Database
  const [daftarJenisLomba, setDaftarJenisLomba] = useState([]);
  const [dataPendaftaran, setDataPendaftaran] = useState([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanKesalahan, setPesanKesalahan] = useState(null);

  // Ambil Data dari API
  useEffect(() => {
    const ambilData = async () => {
      try {
        const token = localStorage.getItem('token_sgdrc');

        // Ambil Data Pendaftaran dan Data Lomba
        const [resPendaftaran, resLomba] = await Promise.all([
          fetch('/api/peserta/pendaftaran', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/peserta/lomba')
        ]);

        // Jika Berhasil
        if (resPendaftaran.ok && resLomba.ok) {
          const rawData = await resPendaftaran.json();
          const daftarLomba = await resLomba.json();

          // Membuat Filter Nama Lomba Dinamis
          const namaLombaDinamis = daftarLomba
            .map(l => (l.nama || l.judul || "").trim().toUpperCase())
            .filter((value, index, self) => value && self.indexOf(value) === index);
          setDaftarJenisLomba(namaLombaDinamis);

          // Mapping Harga Dari Admin
          const mapHarga = {};
          daftarLomba.forEach(l => {
            const namaKunci = (l.nama || l.judul || "").trim().toUpperCase();
            if (namaKunci) {
              mapHarga[namaKunci] = l.harga;
            }
          });

          // Menyesuaikan Format Data
          const dataBersih = rawData.map(d => ({
            id: d.id,
            lomba: d.nama_lomba,
            tim: d.nama_tim,
            peserta: [formatJudul(d.nama_peserta1), formatJudul(d.nama_peserta2), formatJudul(d.nama_peserta3)],
            instansi: d.asal_instansi,
            jenjang: d.jenjang,
            status: (d.status_pendaftaran || "").toLowerCase() === 'success' ? 'TERVERIFIKASI' :
              (d.status_pendaftaran || "").toLowerCase() === 'rejected' ? 'DITOLAK' :
                (d.status_pendaftaran || "").toLowerCase() === 'refund' ? 'REFUNDED' : 'MENUNGGU VERIFIKASI',
            grupWa: d.grup_wa,
            biaya: mapHarga[(d.nama_lomba || "").trim().toUpperCase()] || d.biaya || 0,
            buktiPendaftaran: d.file_bukti_bayar,
            buktiRefund: d.file_bukti_refund,
            peringkat: d.peringkat,
            sertifikatSiap: d.is_sertifikat_siap
          }));

          // Simpan Data
          setDataPendaftaran(dataBersih);
        } else {
          setPesanKesalahan("Gagal memuat data");
        }
      } catch (err) {
        console.error("Gagal menarik data:", err);
        setPesanKesalahan("Koneksi gagal");
      } finally {
        setSedangMemuat(false);
      }
    };
    ambilData();
  }, []);

  // Fungsi Filter Data
  const dataTerfilter = dataPendaftaran.filter(data => {
    const k = (kataKunciCari || "").toLowerCase();

    // Menampilkan Hasil Pencarian Data
    const tim = (data.tim || "").toLowerCase();
    const instansi = (data.instansi || "").toLowerCase();
    const lomba = (data.lomba || "").toLowerCase();
    const jenjang = (data.jenjang || "").toLowerCase();
    const paraPeserta = (data.peserta || []).map(p => (p || "").toLowerCase());

    // Pencairan Data
    const cocokCari =
      tim.includes(k) ||
      instansi.includes(k) ||
      lomba.includes(k) ||
      jenjang.includes(k) ||
      paraPeserta.some(p => p.includes(k));

    const cocokStatus = statusFilter === 'Semua' || data.status === statusFilter;

    // Filter Berdasarkan Lomba
    const cocokLomba = lombaFilter === 'Semua' ||
      (data.lomba || "").trim().toUpperCase() === (lombaFilter || "").trim().toUpperCase();

    return cocokCari && cocokStatus && cocokLomba;
  });

  // Fungsi Unduh Bukti Pendaftaran (menggunakan utility pdfHelper)
  const tanganiUnduh = async (data) => {
    try {
      const dapatkanPengaturanBaru = async () => {
        const res = await fetch('/api/pengaturan', { cache: 'no-store' });
        const settings = await res.json();
        setPengaturan(settings);
        return settings;
      };
      await unduhKwitansi(data, pengaturan, dapatkanPengaturanBaru);
    } catch (err) {
      console.error("Gagal Unduh Bukti:", err);
    }
  };

  return (
    // Halaman Data Peserta
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

      {/* Container Data Peserta */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar apakahSidebarTerbuka={apakahSidebarTerbuka} />

        {/* Container Isi Data Peserta */}
        <div className="flex-1 bg-slate-50 overflow-y-auto peserta-scrollbar px-6 md:px-10 py-8 flex flex-col border-l border-solid border-[#16B9FF] shadow-[-2px_0_8px_rgba(22,185,255,0.1)] relative z-20">
          <div className="w-full">

            {/* Container Judul & Kontrol Halaman*/}
            <div className="mb-8 flex flex-col lg:flex-col lg:landscape:flex-row items-start lg:landscape:items-center justify-between gap-4 lg:gap-6">
              {/* Judul dan Deskripsi */}
              <div className="text-left border-l-4 border-[#E40011] pl-6 animate-in slide-in-from-left duration-700 min-w-fit">
                <h1 className="text-xl font-black mb-1 tracking-normal text-slate-800 uppercase whitespace-normal md:whitespace-nowrap text-left leading-relaxed md:leading-tight">Data Peserta Terdaftar</h1>
                <p className="text-slate-500 text-[9.5px] font-bold tracking-normal uppercase whitespace-normal md:whitespace-nowrap text-left leading-relaxed md:leading-normal">{isHp ? "Kelola status pendaftaran" : "Kelola dan pantau status pendaftaran lomba"}</p>
              </div>

              {/* Container Pencarian dan Filter */}
              <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-full lg:landscape:w-auto md:mt-2 lg:mt-2 lg:landscape:mt-0">
                {/* Input Pencarian */}
                <div className="relative group w-full md:flex-1 lg:w-full lg:landscape:w-auto lg:landscape:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#16B9FF] transition-colors" size={14} />
                  <input
                    type="text"
                    placeholder="Cari Tim..."
                    value={kataKunciCari}
                    onChange={(e) => setKataKunciCari(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[11px] md:text-[11px] lg:text-[9.5px] w-full lg:w-full lg:landscape:w-[160px] font-bold text-slate-800 placeholder:text-slate-600 shadow-sm"
                  />
                </div>

                {/* Container Filter */}
                <div className="flex flex-row gap-2 w-full lg:w-full lg:landscape:w-auto">

                  {/* Filter Pilihan Lomba */}
                  <div className="relative flex-1 md:flex-1 lg:flex-1 lg:landscape:flex-none">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select
                      value={lombaFilter}
                      onChange={(e) => setLombaFilter(e.target.value)}
                      className="pl-8 pr-6 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-[11px] md:text-[11px] lg:text-[9.5px] font-bold text-slate-600 focus:border-[#16B9FF] w-full lg:w-full lg:landscape:w-[160px] shadow-sm"
                    >
                      <option value="Semua">{isHp ? "Semua Lomba" : "Semua Lomba"}</option>
                      {daftarJenisLomba.map(l => <option key={l} value={l}>{formatJudul(l)}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  </div>

                  {/* Filter Status Verifikasi */}
                  <div className="relative flex-1 md:flex-1 lg:flex-1 lg:landscape:flex-none">
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-8 pr-6 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-[11px] md:text-[11px] lg:text-[9.5px] font-bold text-slate-600 focus:border-[#16B9FF] w-full lg:w-full lg:landscape:w-[160px] shadow-sm"
                    >
                      <option value="Semua">{isHp ? "Semua Status" : "Semua Status"}</option>
                      <option value="TERVERIFIKASI">Terverifikasi</option>
                      <option value="MENUNGGU VERIFIKASI">Menunggu Verifikasi</option>
                      <option value="DITOLAK">Ditolak</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tampilan Loading */}
            {sedangMemuat ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-[#16B9FF] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-black animate-pulse uppercase tracking-normal text-[10px]">Memuat Data...</p>
              </div>
            ) :
              // Pesan Kesalahan Jika Data Tidak Muncul
              pesanKesalahan ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-500 font-bold text-xs uppercase tracking-wider mb-4">
                    {pesanKesalahan}
                  </div>
                  <button onClick={() => window.location.reload()} className="text-[10px] font-black text-[#16B9FF] underline uppercase">Coba Lagi</button>
                </div>
              ) :

                // Tampilan Jika Data Masih Kosong
                dataPendaftaran.length === 0 ? (
                  <StateKosong
                    Ikon={UserCircle}
                    judul="Belum Ada Pendaftaran"
                    deskripsi="Kamu belum mendaftarkan tim ke lomba manapun. Ayo mulai petualangan robotikmu sekarang!"
                    tombolTeks="Daftar Lomba Sekarang"
                    tombolHref="/peserta/dashboard"
                  />
                ) :
                  /* Tampilan Jika Hasil Filter Kosong */
                  dataTerfilter.length === 0 ? (
                    <StateKosong
                      Ikon={Database}
                      judul="Data Tidak Ditemukan"
                      deskripsi="Maaf, kami tidak menemukan data peserta yang Anda cari. Silakan periksa kembali filter atau kata kunci Anda."
                    />
                  ) : (

                    /* Container Tabel Daftar Peserta*/
                    <div className="bg-white border border-slate-200 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.05),0_0_20px_rgba(22,185,255,0.06)] overflow-x-auto scrollbar-hide">
                      <div>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="hidden md:table-row bg-[#0B255D] border-b border-white/20">

                              {/* Kolom Toggle khusus iPad Standar */}
                              <th className="px-2 py-2 border-r border-white/30 text-center lg:hidden w-10"></th>

                              {/* Header Tabel */}
                              <th className="px-2 py-3 text-[9.2px] font-black text-white uppercase tracking-wider border-r border-white/10 text-center leading-relaxed min-w-[120px]">Jenis Lomba</th>
                              <th className="px-3 py-3 text-[9.2px] font-black text-white uppercase tracking-wider border-r border-white/10 text-center leading-relaxed">Nama Tim</th>
                              <th className="px-3 py-3 text-[9.2px] font-black text-white uppercase tracking-wider border-r border-white/10 hidden lg:table-cell min-w-[120px] text-center">Peserta 1</th>
                              <th className="px-3 py-3 text-[9.2px] font-black text-white uppercase tracking-wider border-r border-white/10 hidden lg:table-cell min-w-[120px] text-center">Peserta 2</th>
                              <th className="px-3 py-3 text-[9.2px] font-black text-white uppercase tracking-wider border-r border-white/10 hidden lg:table-cell min-w-[120px] text-center">Peserta 3</th>
                              <th className="px-3 py-3 text-[9.2px] font-black text-white uppercase tracking-wider text-center border-r border-white/10 whitespace-nowrap hidden lg:table-cell">Jenjang</th>
                              <th className="px-3 py-3 text-[9.2px] font-black text-white uppercase tracking-wider border-r border-white/10 min-w-[120px] text-center">Asal Instansi</th>
                              <th className="px-3 py-3 text-[9.2px] font-black text-white uppercase tracking-wider text-center border-r border-white/10 min-w-[85px]">Status</th>
                              <th className="px-3 py-3 text-[9.2px] font-black text-white uppercase tracking-wider text-center">Aksi</th>
                            </tr>

                            {/* Header Tampilan HP */}
                            <tr className="md:hidden bg-[#0B255D] border-b border-white/20">
                              <th colSpan="10" className="px-3 py-4 text-[13px] md:text-[9.5px] font-black text-white uppercase tracking-wider text-center leading-relaxed">Jenis Lomba & Nama Tim</th>
                            </tr>
                          </thead>

                          {/* Bagian Isi Tabel */}
                          <tbody className="divide-y divide-slate-200 text-slate-600">
                            {dataTerfilter.map((data) => (
                              <React.Fragment key={data.id}>

                                {/* Baris Tampilan Ipad dan Laptop*/}
                                <tr className="hidden md:table-row hover:bg-slate-50/50 transition-colors group">

                                  {/* Kolom Toggle khusus iPad Standar */}
                                  <td className="px-2 py-2 border-r border-slate-200 text-center lg:hidden">
                                    <button
                                      onClick={() => setBarisTerbuka(barisTerbuka === data.id ? null : data.id)}
                                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${barisTerbuka === data.id ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    >
                                      {barisTerbuka === data.id ? <Minus size={10} className="text-white" /> : <Plus size={10} className="text-white" />}
                                    </button>
                                  </td>

                                  {/* Kolom Lomba */}
                                  <td className="px-2 py-3 border-r border-slate-200 min-w-[120px]">
                                    <span className="text-[9.9px] font-black text-[#16B9FF] uppercase tracking-tight block text-center leading-normal">
                                      {data.lomba}
                                    </span>
                                  </td>

                                  {/* Kolom Nama Tim */}
                                  <td className="px-3 py-3 border-r border-slate-200 leading-normal">
                                    <span className="text-[9.9px] font-black text-slate-800 uppercase tracking-tight block text-center leading-normal">
                                      {data.tim || "-"}
                                    </span>
                                  </td>

                                  {/* Kolom Peserta */}
                                  <td className="px-3 py-3 border-r border-slate-200 text-[10.5px] font-bold leading-normal hidden lg:table-cell text-slate-700 min-w-[105px]">{formatJudul(data.peserta[0])}</td>
                                  <td className="px-3 py-3 border-r border-slate-200 text-[10.5px] font-bold leading-normal hidden lg:table-cell text-slate-700 min-w-[105px]">{formatJudul(data.peserta[1])}</td>
                                  <td className="px-3 py-3 border-r border-slate-200 text-[10.5px] font-bold leading-normal hidden lg:table-cell text-slate-700 min-w-[105px]">{formatJudul(data.peserta[2])}</td>

                                  {/* Kolom Jenjang */}
                                  <td className="px-3 py-3 text-center border-r border-slate-200 text-[10.5px] font-bold leading-relaxed hidden lg:table-cell text-slate-600">{data.jenjang}</td>

                                  {/* Kolom Instansi */}
                                  <td className="px-3 py-3 border-r border-slate-200 font-bold text-[10.5px] tracking-tight leading-normal text-slate-700">{data.instansi}</td>

                                  {/* Kolom Status Verifikasi */}
                                  <td className="px-3 py-3 text-center border-r border-slate-200">
                                    <div className="flex items-center justify-center">
                                      <span className={`text-[10.5px] font-bold tracking-wider ${ambilWarnaStatus(data.status)} whitespace-normal break-words`}>
                                        {data.status.split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Kolom Tombol Aksi */}
                                  <td className="px-3 py-2 text-center min-w-[70px] relative">
                                    {data.status === 'TERVERIFIKASI' ? (
                                      <div className="flex items-center justify-center gap-2">
                                        {/* Tombol Unduh Bukti */}
                                        <div className="relative group/aksi cursor-pointer">
                                          <button
                                            onClick={() => sedangUnduh === null && tanganiUnduh(data)}
                                            disabled={sedangUnduh !== null}
                                            className={`w-6 h-6 flex items-center justify-center ${sedangUnduh === data.id ? 'bg-slate-200' : 'bg-[#16B9FF] hover:bg-[#1299d4]'} text-white rounded-md transition-all active:scale-95 shadow-lg shadow-[#16B9FF]/20 focus:outline-none`}
                                          >
                                            {sedangUnduh === data.id ? <Loader2 size={12} className="text-slate-400 animate-spin" /> : <Download size={12} strokeWidth={3} />}
                                          </button>
                                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#16B9FF] text-white text-[9px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                            {sedangUnduh === data.id ? 'Memproses...' : 'Unduh Bukti'}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#16B9FF]"></div>
                                          </span>
                                        </div>

                                        {/* Link Grup WhatsApp */}
                                        {data.grupWa && (
                                          <div className="relative group/aksi cursor-pointer">
                                            <a
                                              href={data.grupWa}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="w-6 h-6 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-all border border-emerald-500/30 overflow-hidden focus:outline-none"
                                            >
                                              <img src="/aset/icon/whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover scale-150" />
                                            </a>
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-emerald-600 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                              Join Grup
                                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emerald-600"></div>
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) :
                                      // Jika Status Refunded
                                      data.status === 'REFUNDED' ? (
                                        <div className="relative group/aksi cursor-pointer mx-auto w-max">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); window.open(data.buktiRefund, '_blank'); }}
                                            className="w-6 h-6 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-all active:scale-95 shadow-lg shadow-orange-500/20 focus:outline-none"
                                          >
                                            <Eye size={12} strokeWidth={3} />
                                          </button>
                                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-orange-500 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                            Bukti Refund
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-orange-500"></div>
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-[9px] font-bold text-gray-400 italic block leading-none">Proses</span>
                                      )}
                                  </td>
                                </tr>

                                {/* Detail Data (Tampilan Ipad) */}
                                {barisTerbuka === data.id && (
                                  <tr className="hidden md:table-row lg:hidden bg-slate-50 border-b border-slate-100">
                                    <td colSpan="10" className="p-0">
                                      <div className="bg-white px-10 py-4 animate-in slide-in-from-top-2 duration-300 border-t border-slate-100">
                                        <BarisDetailPeserta label="Peserta 1" value={data.peserta[0]} />
                                        <BarisDetailPeserta label="Peserta 2" value={data.peserta[1]} />
                                        <BarisDetailPeserta label="Peserta 3" value={data.peserta[2]} />
                                        <BarisDetailPeserta label="Jenjang" value={data.jenjang} />

                                        {data.status === 'REFUNDED' && (
                                          <div className="mt-4 pt-4 border-t border-slate-100">
                                            <GaleriBuktiRefund buktiRefund={data.buktiRefund} />
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}


                                {/* Detail Data (Tampilan HP) */}
                                <tr className="md:hidden border-b border-slate-100">
                                  <td colSpan="3" className="p-0">
                                    <div
                                      onClick={() => setBarisTerbuka(barisTerbuka === data.id ? null : data.id)}
                                      className="flex items-center gap-3 p-3 cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-all"
                                    >
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${barisTerbuka === data.id ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                        {barisTerbuka === data.id ? <Minus size={12} className="text-white" /> : <Plus size={12} className="text-white" />}
                                      </div>
                                      <div className="flex flex-col leading-relaxed">
                                        <span className="text-[11px] md:text-[10px] font-black text-[#16B9FF] uppercase tracking-wider">{data.lomba}</span>
                                        <span className="text-[13px] md:text-[11px] font-black text-slate-800 uppercase">{data.tim}</span>
                                      </div>
                                    </div>

                                    {/* Detail Data (Tampilan HP Terbuka) */}
                                    {barisTerbuka === data.id && (
                                      <div className="bg-white px-4 py-2 animate-in slide-in-from-top-2 duration-300 border-t border-slate-100">
                                        <BarisDetailPeserta label="Peserta 1" value={data.peserta[0]} />
                                        <BarisDetailPeserta label="Peserta 2" value={data.peserta[1]} />
                                        <BarisDetailPeserta label="Peserta 3" value={data.peserta[2]} />
                                        <BarisDetailPeserta label="Instansi" value={data.instansi} />
                                        <BarisDetailPeserta label="Jenjang" value={data.jenjang} />

                                        {/* Status */}
                                        <div className="flex py-2.5 border-b border-slate-50 items-start">
                                          <div className="w-[100px] flex-shrink-0 flex justify-between">
                                            <span className="text-[11.5px] font-bold text-slate-400 leading-relaxed">Status</span>
                                            <span className="text-[11.5px] font-bold text-slate-400 mr-2 leading-relaxed">:</span>
                                          </div>
                                          <div className="flex-1 text-left">
                                            <span className={`text-[11.5px] font-black leading-relaxed pt-[1px] block ${ambilWarnaStatus(data.status)}`}>
                                              {data.status.split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Kolom Aksi */}
                                        <div className="flex py-2.5 border-b border-slate-50 last:border-0 items-start">
                                          <div className="w-[100px] flex-shrink-0 flex justify-between">
                                            <span className="text-[11.5px] font-bold text-slate-400 leading-relaxed">Aksi</span>
                                            <span className="text-[11.5px] font-bold text-slate-400 mr-2 leading-relaxed">:</span>
                                          </div>
                                          <div className="flex-1 text-left">
                                            <div className="flex gap-2 pt-0.5">
                                              {data.status === 'TERVERIFIKASI' ? (
                                                <>
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); sedangUnduh === null && tanganiUnduh(data); }}
                                                    className={`px-3 py-1.5 ${sedangUnduh === data.id ? 'bg-slate-200 text-slate-400' : 'bg-[#16B9FF] text-white'} text-[9.5px] font-black rounded-md active:scale-95 transition-all flex items-center gap-1`}
                                                  >
                                                    {sedangUnduh === data.id ? <Loader2 size={10} className="animate-spin" /> : 'Invoice'}
                                                  </button>
                                                  {data.grupWa && (
                                                    <a href={data.grupWa} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 bg-emerald-600 text-white text-[9.5px] font-black rounded-md active:scale-95 transition-all">Grup WA</a>
                                                  )}
                                                </>
                                              ) : data.status === 'REFUNDED' ? (
                                                <div className="relative group/aksi cursor-pointer">
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); window.open(data.buktiRefund, '_blank'); }}
                                                    className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-md active:scale-95 transition-all flex items-center justify-center shadow-sm"
                                                  >
                                                    <Eye size={14} strokeWidth={2.5} />
                                                  </button>
                                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-orange-600 text-white text-[9.5px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                                    Bukti Refund
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-orange-600"></div>
                                                  </span>
                                                </div>
                                              ) : (
                                                <span className="text-[11px] font-bold text-slate-400 italic">Sedang Diproses</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Bukti Refund */}
                                        {data.status === 'REFUNDED' && (
                                          <div className="mt-4 pt-4 border-t border-slate-100">
                                            <GaleriBuktiRefund buktiRefund={data.buktiRefund} />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              </React.Fragment>
                            ))
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
          </div>
        </div>
      </div>

      {/* Area Tersembunyi Untuk Cetak Bukti */}
      <div className="fixed top-[-9999px] left-[-9999px] z-[-1]">
        {dataTerfilter.map(data => (
          <div key={`cetak-bukti-${data.id}`} id={`cetak-bukti-${data.id}`}>
            <KwitansiPendaftaran data={data} pengaturan={pengaturan} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataPeserta;
