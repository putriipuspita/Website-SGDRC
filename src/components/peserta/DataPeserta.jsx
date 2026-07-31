'use client';
import React, { useState, useEffect } from 'react';
// Import Icon
import {
  Search, Filter, Download, CheckCircle2, UserCircle, ChevronDown, Plus, Minus, Database, Loader2, Eye, QrCode
} from 'lucide-react';

// Import Link dan useRouter dari React
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dapatkanDataKartuQr } from '@/lib/generateKartuQr';

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
  <div className="flex py-1 border-b border-slate-50 last:border-0 items-start">

    {/* Label dan Titik Dua */}
    <div className="w-[100px] md:w-[120px] flex-shrink-0 flex justify-between">
      <span className="text-[12.2px] md:text-[11.9px] font-bold text-slate-950 leading-relaxed">{label}</span>
      <span className="text-[12.2px] md:text-[11.9px] font-bold text-slate-950 mr-2 md:mr-4 leading-relaxed">:</span>
    </div>

    {/* Nilai */}
    <div className="flex-1 text-left">
      <span className="text-[12.2px] md:text-[11.9px] font-bold leading-relaxed block text-slate-950">{value || "-"}</span>
    </div>
  </div>
);

// Fungsi Lihat Bukti Refund
const GaleriBuktiRefund = ({ buktiRefund }) => (
  <div className="w-full">
    <div className="space-y-2 text-left max-w-md">
      <label className="text-[10px] font-black text-orange-400 uppercase tracking-normal block ml-1">Bukti Transfer Refund (Panitia)</label>

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
  const [barisTerbuka, setBarisTerbuka] = useState([]);
  const [isHp, setIsHp] = useState(false);
  const [sedangUnduh, setSedangUnduh] = useState(null);
  const [pengaturan, setPengaturan] = useState({});

  // Fungsi Toggle Multi Row Accordion
  const tanganiToggleBaris = (id) => {
    setBarisTerbuka(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(id) ? list.filter(i => i !== id) : [...list, id];
    });
  };

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

  // Fungsi Unduh Gambar Kartu QR Code (.PNG) BERFRAME untuk Absensi
  const tanganiUnduhQr = async (data) => {
    try {
      const { regIdFormatted, namaSubjek, lombaTeks, instansiTeks } = dapatkanDataKartuQr(data);
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(regIdFormatted)}`;

      // Load gambar QR Code dari API
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = qrApiUrl;

      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });

      // Buat Canvas untuk menggambar Kartu Frame
      const canvas = document.createElement('canvas');
      const width = 600;
      const height = 730;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Background Kartu (Putih Bersih)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Border Luar Elegan
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // 2. Header Banner (Merah khas SGDRC #E40011)
      ctx.fillStyle = '#E40011';
      ctx.fillRect(10, 10, width - 20, 100);

      // Teks Header (ROBOTICS pakai S)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SUNAN GUNUNG DJATI ROBOTICS COMPETITION', width / 2, 48);

      // Subheader (Title Case: Awalan Kata Besar)
      ctx.fillStyle = '#FFE4E6';
      ctx.font = 'bold 13px "Montserrat", sans-serif';
      ctx.fillText('Kartu Absensi Digital Peserta (SGDRC 2026)', width / 2, 75);

      // 3. Nama Tim / Peserta Solo (Besar & Tegas)
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 28px "Montserrat", sans-serif';
      ctx.fillText(namaSubjek, width / 2, 155);

      // Subtitle Nama Lomba & Instansi
      const subtitleInfo = [lombaTeks, instansiTeks].filter(Boolean).join(' • ');
      ctx.fillStyle = '#16B9FF';
      ctx.font = 'bold 15px "Montserrat", sans-serif';
      ctx.fillText(subtitleInfo, width / 2, 188);

      // Garis Pembatas
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 208);
      ctx.lineTo(width - 40, 208);
      ctx.stroke();

      // 4. Tempatkan QR Code di Tengah
      const qrSize = 340;
      const qrX = (width - qrSize) / 2;
      const qrY = 228;

      // Card Background untuk QR Code
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.fillRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);
      ctx.strokeRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);

      // Gambarkan QR Code
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // 5. No. Registrasi di Bawah QR Code
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(regIdFormatted, width / 2, 618);

      // 6. Footer Informasi Petunjuk (Hitam Italic, Awalan Besar & Diakhiri Titik)
      ctx.fillStyle = '#000000';
      ctx.font = 'italic bold 13px "Montserrat", sans-serif';
      ctx.fillText('Harap tunjukan QR ini kepada panitia pada saat registrasi.', width / 2, 668);

      // 7. Simpan sebagai file PNG dan Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `KARTU_QR_ABSENSI_${namaSubjek.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Gagal Mengunduh Kartu QR Code:", err);
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
        <div className="flex-1 bg-slate-50 overflow-y-auto scrollbar-none lg:peserta-scrollbar px-6 md:px-10 py-8 flex flex-col border-l border-solid border-[#16B9FF] shadow-[-2px_0_8px_rgba(22,185,255,0.1)] relative z-20">
          <div className="w-full">

            {/* Container Judul & Kontrol Halaman*/}
            <div className="mb-8 flex flex-col lg:flex-col lg:landscape:flex-row items-start lg:landscape:items-center justify-between gap-4 lg:gap-6">
              {/* Judul dan Deskripsi */}
              <div className="text-left border-l-4 border-[#E40011] pl-6 animate-in slide-in-from-left duration-700 min-w-fit">
                <h1 className="text-xl font-black mb-1 tracking-normal text-slate-950 uppercase whitespace-normal md:whitespace-nowrap text-left leading-relaxed md:leading-tight">Data Peserta Terdaftar</h1>
                <p className="text-slate-500 text-[9.5px] font-bold tracking-normal uppercase whitespace-normal md:whitespace-nowrap text-left leading-relaxed md:leading-normal">{isHp ? "Kelola status pendaftaran" : "Kelola dan pantau status pendaftaran lomba"}</p>
              </div>

              {/* Container Pencarian dan Filter */}
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full lg:w-full lg:landscape:w-auto md:mt-2 lg:mt-2 lg:landscape:mt-0">
                {/* Input Pencarian */}
                <div className="relative group w-full md:w-1/3 md:flex-1 lg:landscape:w-[160px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#16B9FF] transition-colors" size={14} />
                  <input
                    type="text"
                    placeholder="Cari Tim..."
                    value={kataKunciCari}
                    onChange={(e) => setKataKunciCari(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[12px] md:text-[12px] lg:text-[11px] w-full font-bold text-slate-950 placeholder:text-slate-600 shadow-sm"
                  />
                </div>

                {/* Container Filter */}
                <div className="flex flex-row gap-2 md:gap-3 w-full md:w-2/3 md:flex-[2]">
                  {/* Filter Pilihan Lomba */}
                  <div className="relative flex-1 w-1/2 md:w-1/2 lg:landscape:w-[160px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select
                      value={lombaFilter}
                      onChange={(e) => setLombaFilter(e.target.value)}
                      className="pl-8 pr-6 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-[12px] md:text-[12px] lg:text-[11px] font-bold text-slate-950 focus:border-[#16B9FF] w-full shadow-sm"
                    >
                      <option value="Semua">{isHp ? "Semua Lomba" : "Semua Lomba"}</option>
                      {daftarJenisLomba.map(l => <option key={l} value={l}>{formatJudul(l)}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  </div>

                  {/* Filter Status Verifikasi */}
                  <div className="relative flex-1 w-1/2 md:w-1/2 lg:landscape:w-[160px]">
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-8 pr-6 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-[12px] md:text-[12px] lg:text-[11px] font-bold text-slate-950 focus:border-[#16B9FF] w-full shadow-sm"
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
                    <div className="bg-white border border-slate-200 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.05),0_0_20px_rgba(22,185,255,0.06)] overflow-x-auto custom-scrollbar pb-2">
                      <div>
                        <table className="w-full md:min-w-full lg:min-w-[1240px] text-left border-collapse">
                          <thead>
                            <tr className="hidden md:table-row bg-[#0B255D] border-b border-white/20">

                              {/* Kolom Toggle khusus iPad Standar */}
                              <th className="px-2 py-2 border-r border-white/30 text-center lg:hidden w-10"></th>

                              <th className="px-3 py-3 border-r border-white/10 text-center lg:table-cell"><div className="text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-black text-white uppercase tracking-wider lg:min-w-[150px] whitespace-nowrap text-center">Jenis Lomba</div></th>
                              <th className="px-3 py-3 border-r border-white/10 text-center lg:table-cell"><div className="text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-black text-white uppercase tracking-wider lg:min-w-[160px] whitespace-nowrap text-center">Nama Tim</div></th>
                              <th className="px-3 py-3 border-r border-white/10 text-center hidden lg:table-cell"><div className="text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-black text-white uppercase tracking-wider min-w-[160px] whitespace-nowrap text-center">Peserta 1</div></th>
                              <th className="px-3 py-3 border-r border-white/10 text-center hidden lg:table-cell"><div className="text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-black text-white uppercase tracking-wider min-w-[160px] whitespace-nowrap text-center">Peserta 2</div></th>
                              <th className="px-3 py-3 border-r border-white/10 text-center hidden lg:table-cell"><div className="text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-black text-white uppercase tracking-wider min-w-[160px] whitespace-nowrap text-center">Peserta 3</div></th>
                              <th className="px-3 py-3 border-r border-white/10 text-center hidden lg:table-cell"><div className="text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-black text-white uppercase tracking-wider min-w-[110px] whitespace-nowrap text-center">Jenjang</div></th>
                              <th className="px-3 py-3 border-r border-white/10 text-center lg:table-cell"><div className="text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-black text-white uppercase tracking-wider lg:min-w-[160px] whitespace-nowrap text-center">Asal Instansi</div></th>
                              <th className="px-3 py-3 border-r border-white/10 text-center lg:table-cell"><div className="text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-black text-white uppercase tracking-wider lg:min-w-[120px] whitespace-nowrap text-center">Status</div></th>
                              <th className="px-3 py-3 text-center lg:table-cell"><div className="text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-black text-white uppercase tracking-wider whitespace-nowrap">Aksi</div></th>
                            </tr>

                            {/* Header Tampilan HP */}
                            <tr className="md:hidden bg-[#0B255D] border-b border-white/20">
                              <th colSpan="10" className="px-3 py-4 text-[13px] md:text-[9.5px] font-black text-white uppercase tracking-normal text-center leading-relaxed">Jenis Lomba & Nama Tim</th>
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
                                      onClick={() => tanganiToggleBaris(data.id)}
                                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${barisTerbuka.includes(data.id) ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    >
                                      {barisTerbuka.includes(data.id) ? <Minus size={10} className="text-white" /> : <Plus size={10} className="text-white" />}
                                    </button>
                                  </td>

                                  {/* Kolom Lomba */}
                                  <td className="px-3 py-3 border-r border-slate-200 whitespace-nowrap">
                                    <div className="lg:min-w-[150px]">
                                      <span className="text-[10.6px] xl:text-[11.2px] 2xl:text-[12.2px] font-black text-[#16B9FF] uppercase tracking-tight block text-left leading-normal whitespace-nowrap">
                                        {data.lomba}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Kolom Nama Tim */}
                                  <td className="px-3 py-3 border-r border-slate-200 leading-normal">
                                    <div className="lg:min-w-[160px]">
                                      <span className="text-[10.6px] xl:text-[11.2px] 2xl:text-[12.2px] font-black text-slate-950 uppercase tracking-tight block text-left leading-normal">
                                        {data.tim || "-"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Kolom Peserta */}
                                  <td className="px-3 py-3 border-r border-slate-200 text-[11.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold leading-normal hidden lg:table-cell text-slate-950">
                                    <div className="min-w-[160px]">{formatJudul(data.peserta[0])}</div>
                                  </td>
                                  <td className="px-3 py-3 border-r border-slate-200 text-[11.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold leading-normal hidden lg:table-cell text-slate-950">
                                    <div className="min-w-[160px]">{formatJudul(data.peserta[1])}</div>
                                  </td>
                                  <td className="px-3 py-3 border-r border-slate-200 text-[11.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold leading-normal hidden lg:table-cell text-slate-950">
                                    <div className="min-w-[160px]">{formatJudul(data.peserta[2])}</div>
                                  </td>

                                  {/* Kolom Jenjang */}
                                  <td className="px-3 py-3 text-center border-r border-slate-200 text-[11.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold leading-relaxed hidden lg:table-cell text-slate-950">
                                    <div className="min-w-[110px] whitespace-nowrap text-center">{data.jenjang}</div>
                                  </td>

                                  {/* Kolom Instansi */}
                                  <td className="px-3 py-3 border-r border-slate-200 font-bold text-[11.1px] xl:text-[11.7px] 2xl:text-[12.7px] tracking-tight leading-normal text-slate-950">
                                    <div className="lg:min-w-[160px]">{data.instansi}</div>
                                  </td>

                                  {/* Kolom Status Verifikasi */}
                                  <td className="px-3 py-3 text-center border-r border-slate-200">
                                    <div className="flex items-center justify-center lg:min-w-[120px]">
                                      <span className={`text-[12.5px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold tracking-normal ${ambilWarnaStatus(data.status)} whitespace-nowrap`}>
                                        {data.status.split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Kolom Tombol Aksi */}
                                  <td className="px-3 py-2 text-center min-w-[90px] relative">
                                    {data.status === 'TERVERIFIKASI' ? (
                                      <div className="flex items-center justify-center gap-2">
                                        {/* Tombol Unduh Bukti (PDF) */}
                                        <div className="relative group/aksi cursor-pointer">
                                          <button
                                            onClick={() => sedangUnduh === null && tanganiUnduh(data)}
                                            disabled={sedangUnduh !== null}
                                            className={`w-6 h-6 flex items-center justify-center ${sedangUnduh === data.id ? 'bg-slate-200' : 'bg-[#16B9FF] hover:bg-[#1299d4]'} text-white rounded-md transition-all active:scale-95 shadow-lg shadow-[#16B9FF]/20 focus:outline-none`}
                                          >
                                            {sedangUnduh === data.id ? <Loader2 size={12} className="text-slate-400 animate-spin" /> : <Download size={12} strokeWidth={3} />}
                                          </button>
                                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#16B9FF] text-white text-[9px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                            {sedangUnduh === data.id ? 'Memproses...' : 'Unduh Bukti PDF'}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#16B9FF]"></div>
                                          </span>
                                        </div>

                                        {/* Tombol Unduh QR Code (PNG) */}
                                        <div className="relative group/aksi cursor-pointer">
                                          <button
                                            onClick={() => tanganiUnduhQr(data)}
                                            className="w-6 h-6 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-all active:scale-95 shadow-lg shadow-indigo-600/20 focus:outline-none"
                                          >
                                            <QrCode size={12} strokeWidth={2.5} />
                                          </button>
                                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-indigo-600 text-white text-[9px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                            Unduh QR Absensi
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-indigo-600"></div>
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
                                              <img src="/aset/icon/whatsapp.webp" alt="WhatsApp" className="w-full h-full object-cover scale-150" />
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
                                {barisTerbuka.includes(data.id) && (
                                  <tr className="hidden md:table-row lg:hidden bg-slate-50 border-b border-slate-100">
                                    <td colSpan="10" className="p-0">
                                      <div className="bg-white px-6 md:px-8 py-2 animate-in slide-in-from-top-2 duration-300 border-t border-slate-100">
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
                                      onClick={() => tanganiToggleBaris(data.id)}
                                      className="flex items-center gap-3 p-3 cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-all"
                                    >
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${barisTerbuka.includes(data.id) ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                        {barisTerbuka.includes(data.id) ? <Minus size={12} className="text-white" /> : <Plus size={12} className="text-white" />}
                                      </div>
                                      <div className="flex flex-col leading-relaxed">
                                        <span className="text-[11.5px] md:text-[10px] font-black text-[#16B9FF] uppercase tracking-normal">{data.lomba}</span>
                                        <span className="text-[11.5px] md:text-[10px] font-black text-slate-950 uppercase tracking-normal">{data.tim}</span>
                                      </div>
                                    </div>

                                    {/* Detail Data (Tampilan HP Terbuka) */}
                                    {barisTerbuka.includes(data.id) && (
                                      <div className="bg-white px-4 py-2 animate-in slide-in-from-top-2 duration-300 border-t border-slate-100">
                                        <BarisDetailPeserta label="Peserta 1" value={data.peserta[0]} />
                                        <BarisDetailPeserta label="Peserta 2" value={data.peserta[1]} />
                                        <BarisDetailPeserta label="Peserta 3" value={data.peserta[2]} />
                                        <BarisDetailPeserta label="Instansi" value={data.instansi} />
                                        <BarisDetailPeserta label="Jenjang" value={data.jenjang} />

                                        {/* Status */}
                                        <div className="flex py-1 border-b border-slate-50 items-start">
                                          <div className="w-[100px] flex-shrink-0 flex justify-between">
                                            <span className="text-[12px] font-bold text-slate-950 leading-relaxed">Status</span>
                                            <span className="text-[12px] font-bold text-slate-950 mr-2 leading-relaxed">:</span>
                                          </div>
                                          <div className="flex-1 text-left">
                                            <span className={`text-[12px] font-black leading-relaxed pt-[1px] block ${ambilWarnaStatus(data.status)}`}>
                                              {data.status.split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Kolom Aksi */}
                                        <div className="flex py-1 border-b border-slate-50 last:border-0 items-start">
                                          <div className="w-[100px] flex-shrink-0 flex justify-between">
                                            <span className="text-[12px] font-bold text-slate-950 leading-relaxed">Aksi</span>
                                            <span className="text-[12px] font-bold text-slate-950 mr-2 leading-relaxed">:</span>
                                          </div>
                                          <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2.5 pt-0.5">
                                              {data.status === 'TERVERIFIKASI' ? (
                                                <>
                                                  {/* Tombol Unduh Bukti (PDF) HP */}
                                                  <div className="relative group/aksi cursor-pointer">
                                                    <button
                                                      onClick={() => sedangUnduh === null && tanganiUnduh(data)}
                                                      disabled={sedangUnduh !== null}
                                                      className={`w-7 h-7 flex items-center justify-center ${sedangUnduh === data.id ? 'bg-slate-200' : 'bg-[#16B9FF] hover:bg-[#1299d4]'} text-white rounded-md transition-all active:scale-95 shadow-md shadow-[#16B9FF]/20 focus:outline-none`}
                                                    >
                                                      {sedangUnduh === data.id ? <Loader2 size={13} className="text-slate-400 animate-spin" /> : <Download size={13} strokeWidth={3} />}
                                                    </button>
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#16B9FF] text-white text-[9.5px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                                      {sedangUnduh === data.id ? 'Memproses...' : 'Unduh Bukti PDF'}
                                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#16B9FF]"></div>
                                                    </span>
                                                  </div>

                                                  {/* Tombol Unduh QR Code (PNG) HP */}
                                                  <div className="relative group/aksi cursor-pointer">
                                                    <button
                                                      onClick={() => tanganiUnduhQr(data)}
                                                      className="w-7 h-7 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-all active:scale-95 shadow-md shadow-indigo-600/20 focus:outline-none"
                                                    >
                                                      <QrCode size={13} strokeWidth={2.5} />
                                                    </button>
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-indigo-600 text-white text-[9.5px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                                      Unduh QR Absensi
                                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-indigo-600"></div>
                                                    </span>
                                                  </div>

                                                  {/* Link Grup WhatsApp HP */}
                                                  {data.grupWa && (
                                                    <div className="relative group/aksi cursor-pointer">
                                                      <a
                                                        href={data.grupWa}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="w-7 h-7 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-all border border-emerald-500/30 overflow-hidden focus:outline-none"
                                                      >
                                                        <img src="/aset/icon/whatsapp.webp" alt="WhatsApp" className="w-full h-full object-cover scale-150" />
                                                      </a>
                                                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-emerald-600 text-white text-[9.5px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                                        Join Grup
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emerald-600"></div>
                                                      </span>
                                                    </div>
                                                  )}
                                                </>
                                              ) : data.status === 'REFUNDED' ? (
                                                <div className="relative group/aksi cursor-pointer">
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); window.open(data.buktiRefund, '_blank'); }}
                                                    className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-md active:scale-95 transition-all flex items-center justify-center shadow-md shadow-orange-500/20 focus:outline-none"
                                                  >
                                                    <Eye size={13} strokeWidth={3} />
                                                  </button>
                                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-orange-500 text-white text-[9.5px] font-bold rounded opacity-0 invisible group-hover/aksi:opacity-100 group-hover/aksi:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl">
                                                    Bukti Refund
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-orange-500"></div>
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
