'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Import Icon
import {
  Search, Filter, Trash2, Edit3, CheckCircle2, Download, Plus, FileText, ChevronDown, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';

// Import Komponen
import toast from 'react-hot-toast';
import NavbarAdmin from '../navigasi/NavbarAdmin';
import SidebarAdmin from '../navigasi/SidebarAdmin';
import TambahPeserta from './TambahPeserta';
import Verifikasi from './Verifikasi';
import EditPeserta from './EditPeserta';
import Konfirmasi from '../../element/Konfirmasi';

// Import Element Reusable
import { TableBase } from '../../element/TableBase';

// Import Utility
import { fetchDenganToken } from '../../../lib/apiClient';
import { cekTipeLomba } from '../../../lib/formatHelper';

// Komponen Utama Peserta Lomba
const PesertaLomba = () => {
  const { slug } = useParams();
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useState(true);
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);
  const [apakahTambahTerbuka, setApakahTambahTerbuka] = useState(false);
  const [loading, setLoading] = useState(true);

  // State Verifikasi, Edit & Hapus
  const [apakahVerifikasiTerbuka, setApakahVerifikasiTerbuka] = useState(false);
  const [dataVerifikasi, setDataVerifikasi] = useState(null);
  const [apakahEditTerbuka, setApakahEditTerbuka] = useState(false);
  const [dataEdit, setDataEdit] = useState(null);
  const [apakahHapusTerbuka, setApakahHapusTerbuka] = useState(false);
  const [dataHapus, setDataHapus] = useState(null);

  // State Paginasi
  const [halamanSekarang, setHalamanSekarang] = useState(1);
  const dataPerHalaman = 15;

  // State Data Peserta, Pencarian, Filter & Status
  const [daftarPeserta, setDaftarPeserta] = useState([]);
  const [kataKunci, setKataKunci] = useState('');
  const [filterJenjang, setFilterJenjang] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [lombaInfo, setLombaInfo] = useState(null);

  // Ambil Data Info Lomba
  useEffect(() => {
    const ambilLombaInfo = async () => {
      try {
        const res = await fetch('/api/peserta/lomba');
        if (res.ok) {
          const data = await res.json();
          const targetNama = slug?.replace(/-/g, ' ').toUpperCase();
          const ketemu = data.find(l => l.nama.toUpperCase() === targetNama);
          setLombaInfo(ketemu || null);
        }
      } catch (err) {
        console.error("Gagal mengambil info lomba:", err);
      }
    };
    if (slug) ambilLombaInfo();
  }, [slug]);

  // Ambil Data Peserta dari API
  const ambilData = async () => {
    setLoading(true);
    try {
      const res = await fetchDenganToken(`/api/admin/peserta?slug=${slug}&search=${kataKunci}`);

      // Jika Berhasil
      if (res.ok) {
        const data = await res.json();
        const dataTerformat = data.map(p => ({
          id: p.id,
          namaTim: p.nama_tim,
          peserta1: p.nama_peserta1,
          peserta2: p.nama_peserta2,
          peserta3: p.nama_peserta3,
          instansi: p.asal_instansi,
          jenjang: p.jenjang,
          whatsapp: p.whatsapp,
          status: p.status_pendaftaran === 'success' ? 'Terverifikasi' :
            (p.status_pendaftaran === 'rejected' ? 'Ditolak' :
              (p.status_pendaftaran === 'refund' ? 'Refunded' : 'Belum Terverifikasi')),
          tanggal: new Date(p.tanggal_pendaftaran).toLocaleDateString('id-ID'),
          bukti: p.file_bukti_bayar ? `${p.file_bukti_bayar}` : null,
          buktiRefund: p.file_bukti_refund ? `${p.file_bukti_refund}` : null,
          email: p.email
        }));
        setDaftarPeserta(dataTerformat);
      }

      // Jika Error Server
    } catch (err) {
      console.error("Gagal ambil data admin:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Search
  useEffect(() => {
    const timer = setTimeout(() => {
      ambilData();
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, kataKunci]);

  // Fungsi Hapus Peserta
  const tanganiHapus = async () => {
    // Kirim Data Ke API
    try {
      const res = await fetchDenganToken('/api/admin/peserta', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: dataHapus.id })
      });

      // Jika Berhasil
      if (res.ok) {
        toast.success("Pendaftaran Berhasil Dihapus");
        ambilData();
        setApakahHapusTerbuka(false);
      }
      // Jika Gagal 
      else {
        toast.error("Gagal Menghapus Data");
      }

      // Jika Server Error
    } catch (err) {
      toast.error("Gagal Menghapus Data");
    }
  };

  // Fungsi Export ke Excel
  const eksporData = async () => {
    try {
      toast.loading("Mengekspor data ke Excel...", { id: "export" });
      const res = await fetchDenganToken('/api/admin/peserta');

      // Jika Gagal
      if (!res.ok) throw new Error("Gagal mengambil data peserta");
      const data = await res.json();

      // Jika Tidak Ada Data
      if (!data || data.length === 0) {
        toast.error("Tidak ada data peserta", { id: "export" });
        return;
      }

      // Kelompokkan Berdasarkan Nama Lomba
      const groupedData = data.reduce((acc, p) => {
        const lombaName = p.nama_lomba || "Lainnya";
        if (!acc[lombaName]) acc[lombaName] = [];
        acc[lombaName].push({
          "Tanggal": new Date(p.tanggal_pendaftaran).toLocaleString('id-ID'),
          "Nama Tim": p.nama_tim || "-",
          "Peserta 1": p.nama_peserta1 || "-",
          "Peserta 2": p.nama_peserta2 || "-",
          "Peserta 3": p.nama_peserta3 || "-",
          "WhatsApp": p.whatsapp || "-",
          "Jenjang": p.jenjang || "-",
          "Instansi": p.asal_instansi || "-",
          "Status": p.status_pendaftaran || "-",
        });
        return acc;
      }, {});

      // Impor Library & Buat Workbook
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();

      // Buat Sheet Untuk Tiap Lomba
      Object.keys(groupedData).forEach(lombaName => {
        let safeSheetName = lombaName.replace(/[\\/?*[\]]/g, '').substring(0, 31);
        const worksheet = XLSX.utils.json_to_sheet(groupedData[lombaName]);
        XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
      });

      // Tambahkan Sheet Ke Workbook
      XLSX.writeFile(workbook, "Data_Peserta_Semua_Lomba.xlsx");
      toast.success("Berhasil ekspor ke Excel!", { id: "export" });

      // Jika Gagal
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengekspor data", { id: "export" });
    }
  };

  const { apakahSolo, apakahKelompokMaks3 } = cekTipeLomba(slug, lombaInfo);

  // Logika Filter Data Jenjang
  const dapatkanOpsiJenjang = () => {
    const teksJenjang = lombaInfo?.jenjang || '';
    // Jika Jenjang
    if (!teksJenjang) {
      return ['TK', 'SD / MI', 'SMP / MTS', 'SMA / SMK / MA', 'Perguruan Tinggi'];
    }


    let daftar = [];
    const teksKecil = teksJenjang.toLowerCase();
    const matchUmur = teksKecil.match(/(\d+)\s*tahun/);

    // Jika Umur
    if (matchUmur) {
      const angkaUmur = parseInt(matchUmur[1]);
      if (angkaUmur < 9) {
        daftar = ['TK', 'SD'];
      } else {
        daftar = ['SD'];
      }
    } else {
      daftar = teksJenjang
        .split(/ - |, | dan | & /i)
        .map(item => item.trim())
        .filter(item => item !== "");
    }

    return [...new Set(daftar)];
  };

  // Data Terfilter
  const dataTerfilter = daftarPeserta.filter(p => {
    const cocokJenjang = filterJenjang === 'Semua' ||
      p.jenjang === filterJenjang ||
      ((filterJenjang === 'SD' || filterJenjang === 'SD / MI') && (p.jenjang === 'SD' || p.jenjang === 'SD / MI')) ||
      ((filterJenjang === 'SMP' || filterJenjang === 'SMP / MTS') && (p.jenjang === 'SMP' || p.jenjang === 'SMP / MTS')) ||
      ((filterJenjang === 'SMA' || filterJenjang === 'SMA / SMK / MA') && (p.jenjang === 'SMA' || p.jenjang === 'SMA / SMK / MA')) ||
      ((filterJenjang === 'Mahasiswa' || filterJenjang === 'Perguruan Tinggi') && (p.jenjang === 'Mahasiswa' || p.jenjang === 'Perguruan Tinggi'));
    const cocokStatus = filterStatus === 'Semua' || p.status === filterStatus;
    return cocokJenjang && cocokStatus;
  });

  // Kalkulasi Paginasi
  const totalHalaman = Math.ceil(dataTerfilter.length / dataPerHalaman) || 1;
  const indeksTerakhir = halamanSekarang * dataPerHalaman;
  const indeksPertama = indeksTerakhir - dataPerHalaman;
  const dataTampil = dataTerfilter.slice(indeksPertama, indeksTerakhir);

  const namaLombaHeader = slug ? slug.replace(/-/g, ' ').toUpperCase() : 'DAFTAR PESERTA';

  // Layout
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-montserrat flex flex-col overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F1F5F9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; transition: all 0.3s; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        
        @media (min-width: 768px) and (max-width: 1024px) {
          .ipad-column-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
        }
      `}</style>

      {/* Navbar */}
      <NavbarAdmin
        apakahSidebarTerbuka={apakahSidebarTerbuka}
        setApakahSidebarTerbuka={setApakahSidebarTerbuka}
        apakahProfilTerbuka={apakahProfilTerbuka}
        setApakahProfilTerbuka={setApakahProfilTerbuka}
      />


      <div className="flex flex-1 pt-14">
        <SidebarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} />

        {/* Container Konten */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-500 ${apakahSidebarTerbuka ? 'md:ml-56' : 'ml-0'}`}>
          <div className="max-w-[1500px] mx-auto space-y-8">

            {/* Container Judul, Export dan Tambah */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ipad-column-header animate-in slide-in-from-left duration-700">
              {/* Judul */}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase leading-tight">
                  PESERTA {namaLombaHeader}
                </h1>
              </div>

              {/* Container Export dan Tambah */}
              <div className="flex gap-3">
                {/* TOmbol Export */}
                <button
                  onClick={eksporData}
                  className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wide"
                >
                  <Download size={14} /> Export Data
                </button>

                {/* Tombol Tambah */}
                <button
                  onClick={() => setApakahTambahTerbuka(true)}
                  className="bg-[#0B255D] hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 shadow-lg shadow-[#0B255D]/20 uppercase tracking-wide active:scale-95"
                >
                  <Plus size={16} /> Tambah Peserta
                </button>
              </div>
            </div>

            {/* Container Filter & Search */}
            <div className="flex flex-col md:flex-row items-center gap-3 w-full">
              {/* Container Search Bar */}
              <div className="relative group w-full md:w-72">
                {/* Icon */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#16B9FF] transition-colors" size={13} />

                {/* Input */}
                <input
                  type="text"
                  placeholder="Cari Peserta..."
                  value={kataKunci}
                  onChange={(e) => setKataKunci(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[10.5px] font-bold text-slate-800 placeholder:text-slate-500 shadow-sm w-full"
                />
              </div>

              {/* Container Filter */}
              <div className="flex gap-2.5 w-full md:w-auto">
                {/* Container Filter Jenjang */}
                <div className="relative flex-1 md:w-40">
                  {/* Icon */}
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />

                  {/* Nilai */}
                  <select
                    value={filterJenjang}
                    onChange={(e) => setFilterJenjang(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-[10.5px] font-bold text-slate-600 focus:border-[#16B9FF] w-full shadow-sm"
                  >
                    <option value="Semua">Semua Jenjang</option>
                    {dapatkanOpsiJenjang().map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>

                  {/* Icon Dropdown */}
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                </div>

                {/* Container Filter Status */}
                <div className="relative flex-1 md:w-40">
                  {/* Icon */}
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />

                  {/* Nilai */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none appearance-none cursor-pointer text-[10.5px] font-bold text-slate-600 focus:border-[#16B9FF] w-full shadow-sm"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Terverifikasi">Terverifikasi</option>
                    <option value="Belum Terverifikasi">Belum Terverifikasi</option>
                    <option value="Refunded">Refunded</option>
                  </select>

                  {/* Icon Dropdown */}
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                </div>
              </div>
            </div>

            {/* Container Tabel */}
            <TableBase
              loading={loading}
              loadingText="Memuat Data Peserta..."
              isEmpty={daftarPeserta.length === 0 && kataKunci === ''}
              footer={
                <div className="px-6 py-3 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-[11px] font-bold text-slate-600">
                    Menampilkan {indeksPertama + 1} - {Math.min(indeksTerakhir, dataTerfilter.length)} dari {dataTerfilter.length} data
                  </p>

                  {/* Container Tombol */}
                  <div className="flex items-center gap-2.5">
                    {/* Tombol Sebelumnya */}
                    <button
                      disabled={halamanSekarang === 1}
                      onClick={() => setHalamanSekarang(halamanSekarang - 1)}
                      className={`group flex items-center gap-1.5 text-[11px] font-bold transition-all text-slate-600
                          ${halamanSekarang === 1 ? 'cursor-not-allowed opacity-50' : 'hover:text-[#16B9FF]'}`}
                    >
                      <ChevronLeft size={16} className={`transition-transform ${halamanSekarang !== 1 && 'group-hover:-translate-x-0.5'}`} />
                      Sebelumnya
                    </button>

                    {/* Nomor Halaman */}
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8FAFC] border-2 border-slate-100 text-[#0B255D] text-[12px] font-black shadow-sm">
                      {halamanSekarang}
                    </div>

                    {/* Tombol Selanjutnya */}
                    <button
                      disabled={halamanSekarang >= totalHalaman}
                      onClick={() => setHalamanSekarang(halamanSekarang + 1)}
                      className={`group flex items-center gap-1.5 text-[11px] font-bold transition-all text-slate-600
                          ${halamanSekarang >= totalHalaman ? 'cursor-not-allowed opacity-50' : 'hover:text-[#16B9FF]'}`}
                    >
                      Selanjutnya
                      <ChevronRight size={16} className={`transition-transform ${halamanSekarang < totalHalaman && 'group-hover:translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              }
              // Data Belum Ada
              emptyText="Data Belum Ada"
              notFound={dataTampil.length === 0 && (daftarPeserta.length > 0 || kataKunci !== '')}
              notFoundText="Data tidak ditemukan"
              headers={[
                { label: 'Tanggal' },
                ...(!apakahSolo ? [{ label: 'Nama Tim' }] : []),
                { label: 'Peserta 1' },
                ...(!apakahSolo ? [{ label: 'Peserta 2' }] : []),
                ...(apakahKelompokMaks3 ? [{ label: 'Peserta 3' }] : []),
                { label: 'WhatsApp' },
                { label: 'Jenjang' },
                { label: 'Asal Instansi' },
                { label: 'Status' },
                { label: 'Aksi' }
              ]}
            >
              {dataTampil.map((p) => (
                <tr key={p.id} className={`transition-colors group ${p.status === 'REFUNDED' ? 'bg-slate-100 opacity-70' : 'hover:bg-slate-50/50'}`}>

                  {/* Tanggal */}
                  <td className="px-4 py-2.5 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed">{p.tanggal}</td>

                  {/* Nama Tim */}
                  {!apakahSolo && (
                    <td className="px-4 py-2.5 border-r border-slate-200 text-center text-[10.8px] font-black text-[#16B9FF] uppercase tracking-wider leading-relaxed">
                      {p.namaTim || '-'}
                    </td>
                  )}

                  {/* Nama Peserta */}
                  <td className="px-4 py-2.5 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed">{p.peserta1}</td>
                  {!apakahSolo && <td className="px-4 py-2.5 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed">{p.peserta2 || '-'}</td>}
                  {apakahKelompokMaks3 && <td className="px-4 py-2.5 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed">{p.peserta3 || '-'}</td>}

                  {/* WhatsApp, Jenjang, Asal Instansi */}
                  <td className="px-4 py-2.5 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed">{p.whatsapp}</td>
                  <td className="px-4 py-2.5 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed">{p.jenjang}</td>
                  <td className="px-4 py-2.5 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed">{p.instansi}</td>

                  {/* Status */}
                  <td className="px-4 py-2.5 border-r border-slate-200 text-center leading-tight">
                    <span className={`text-[9.8px] font-black uppercase tracking-wider leading-tight ${p.status === 'Terverifikasi' ? 'text-emerald-500' :
                      p.status === 'Ditolak' ? 'text-red-500' :
                        p.status === 'Refunded' ? 'text-orange-500' :
                          'text-amber-500'
                      }`}>
                      {p.status}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Tombol Verifikasi */}
                      <button
                        onClick={() => {
                          setDataVerifikasi({
                            id: p.id,
                            nama: p.namaTim || p.peserta1,
                            lomba: namaLombaHeader,
                            bukti: p.bukti,
                            buktiRefund: p.buktiRefund,
                            status: p.status
                          });
                          setApakahVerifikasiTerbuka(true);
                        }}
                        title="Verifikasi"
                        className="w-7 h-7 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-md transition-all border border-emerald-500/20"
                      >
                        <FileText size={14} />
                      </button>

                      {/* Tombol Edit */}
                      <button
                        onClick={() => {
                          setDataEdit({
                            id: p.id,
                            email: p.email || 'peserta@gmail.com',
                            namaTim: p.namaTim,
                            peserta1: p.peserta1,
                            peserta2: p.peserta2,
                            peserta3: p.peserta3,
                            instansi: p.instansi,
                            whatsapp: p.whatsapp,
                            jenjang: p.jenjang,
                            bukti: p.bukti
                          });
                          setApakahEditTerbuka(true);
                        }}
                        title="Edit"
                        className="w-7 h-7 flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-md transition-all border border-blue-500/20"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Tombol Hapus */}
                      <button
                        onClick={() => {
                          setDataHapus(p);
                          setApakahHapusTerbuka(true);
                        }}
                        title="Hapus"
                        className="w-7 h-7 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-md transition-all border border-red-500/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </TableBase>

          </div>
        </main>
      </div>

      {/* Modal Tambah Peserta */}
      <TambahPeserta
        apakahTerbuka={apakahTambahTerbuka}
        setApakahTerbuka={setApakahTambahTerbuka}
        slugLomba={slug}
        lombaInfo={lombaInfo}
        onSuccess={ambilData}
      />

      {/* Modal Verifikasi Pembayaran */}
      <Verifikasi
        apakahTerbuka={apakahVerifikasiTerbuka}
        setApakahTerbuka={setApakahVerifikasiTerbuka}
        dataPeserta={dataVerifikasi}
        onSuccess={ambilData}
      />

      {/* Modal Edit Peserta */}
      <EditPeserta
        apakahTerbuka={apakahEditTerbuka}
        setApakahTerbuka={setApakahEditTerbuka}
        dataPeserta={dataEdit}
        slugLomba={slug}
        lombaInfo={lombaInfo}
        onSuccess={ambilData}
      />

      {/* Modal Konfirmasi Hapus */}
      <Konfirmasi
        apakahTerbuka={apakahHapusTerbuka}
        setApakahTerbuka={setApakahHapusTerbuka}
        dataNama={dataHapus?.namaTim || dataHapus?.peserta1}
        onConfirm={tanganiHapus}
        tipe="tim"
      />
    </div>
  );
};

export default PesertaLomba;
