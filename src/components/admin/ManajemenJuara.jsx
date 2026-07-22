'use client';
import React, { useState, useEffect } from 'react';
// Import Icon
import {
  Award,
  Search,
  ChevronDown,
  Save,
  LayoutGrid,
  Download
} from 'lucide-react';

// Import Komponen
import NavbarAdmin from './navigasi/NavbarAdmin';
import SidebarAdmin from './navigasi/SidebarAdmin';

// Import Utility
import { formatJudul } from '../../lib/formatHelper';
import { gambarTeksSertifikat, muatFontSertifikat } from '../../lib/pdfHelper';
import { fetchDenganToken } from '../../lib/apiClient';
import useSidebar from '../../hooks/useSidebar';

// Komponen Utama Manajemen Juara & Sertifikat Pemenang
const ManajemenJuara = () => {
  // State Utama Halaman
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useSidebar('sidebarAdmin');
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);
  const [kategoriTerpilih, setKategoriTerpilih] = useState('');
  const [daftarLomba, setDaftarLomba] = useState([]);
  const [kataKunci, setKataKunci] = useState('');
  const [daftarPemenang, setDaftarPemenang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);
  const [sedangUnduh, setSedangUnduh] = useState(false);
  const [sedangUnduhZIP, setSedangUnduhZIP] = useState(false);
  const [progressZIP, setProgressZIP] = useState({ current: 0, total: 0 });
  const [apakahMenuUnduhTerbuka, setApakahMenuUnduhTerbuka] = useState(false);

  // Fungsi Ambil Data Lomba dan Pendaftaran Peserta Terverifikasi
  const ambilData = async () => {
    setLoading(true);
    try {
      let dataLombaTemp = [];
      try {
        // Ambil data lomba
        const resL = await fetch('/api/peserta/lomba');
        if (resL.ok) {
          const dataL = await resL.json();
          dataLombaTemp = dataL;
          setDaftarLomba(dataL);
          setKategoriTerpilih(prev => {
            if (prev) return prev;
            return dataL.length > 0 ? dataL[0].nama.toUpperCase() : '';
          });
        }
      } catch (errL) {
        console.error("Gagal mengambil daftar lomba:", errL);
      }

      // Ambil data pendaftar terverifikasi dengan token otomatis
      const res = await fetchDenganToken(`/api/admin/peserta?t=${Date.now()}`, {
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();

        // Filter hanya peserta yang pembayarannya sukses (terverifikasi)
        let dataTerverifikasi = data.filter(d => d.status_pendaftaran === 'success');
        const kategoriOrder = dataLombaTemp.map(l => l.nama.toUpperCase());

        // Urutkan berdasarkan kategori lomba dan nama tim
        dataTerverifikasi.sort((a, b) => {
          const idxA = kategoriOrder.indexOf((a.nama_lomba || "").toUpperCase());
          const idxB = kategoriOrder.indexOf((b.nama_lomba || "").toUpperCase());
          if (idxA !== -1 && idxB !== -1) {
            if (idxA !== idxB) return idxA - idxB;
          } else if (idxA !== -1) {
            return -1;
          } else if (idxB !== -1) {
            return 1;
          }
          return (a.nama_tim || "").localeCompare(b.nama_tim || "");
        });

        // Set index global sertifikat per anggota tim
        let currentGlobalPesertaIndex = 0;
        let currentGlobalJuaraIndex = 0;
        dataTerverifikasi = dataTerverifikasi.map(tim => {
          const startIdxPeserta = currentGlobalPesertaIndex;
          const startIdxJuara = currentGlobalJuaraIndex;
          const members = [tim.nama_peserta1, tim.nama_peserta2, tim.nama_peserta3].filter(n => n && n.trim() !== "");
          currentGlobalPesertaIndex += members.length;
          if (tim.peringkat) {
            currentGlobalJuaraIndex += members.length;
          }
          return {
            ...tim,
            global_start_idx_peserta: startIdxPeserta,
            global_start_idx_juara: startIdxJuara
          };
        });
        setDaftarPemenang(dataTerverifikasi);
      }
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Muat data saat pertama kali dirender
  useEffect(() => {
    ambilData();
  }, []);



  // Filter data pemenang berdasarkan kategori dan kata kunci pencarian
  const dataTampil = daftarPemenang.filter(tim => {
    const cocokKategori = (tim.nama_lomba || "").toUpperCase() === kategoriTerpilih.toUpperCase();
    const cocokSearch = (tim.nama_tim || "").toLowerCase().includes(kataKunci.toLowerCase()) ||
      (tim.nama_peserta1 || "").toLowerCase().includes(kataKunci.toLowerCase()) ||
      (tim.asal_instansi || "").toLowerCase().includes(kataKunci.toLowerCase());
    return cocokKategori && cocokSearch;
  });

  const apakahSemuaAktif = dataTampil.length > 0 && dataTampil.every(t => t.is_sertifikat_siap === 1);

  // Mengatur Peringkat Juara Sementara
  const handleSetJuara = (id, value) => {
    setDaftarPemenang(prev => prev.map(p => p.id === id ? { ...p, peringkat: value } : p));
  };

  // Mengatur Status Kesiapan Sertifikat Sementara
  const handleSetSertifikat = (id, value) => {
    setDaftarPemenang(prev => prev.map(p => p.id === id ? { ...p, is_sertifikat_siap: value } : p));
  };

  // Fungsi Unduh Massal Sertifikat format PDF
  const tanganiUnduhMasal = async (tipe) => {
    setSedangUnduh(true);
    setApakahMenuUnduhTerbuka(false);
    try {
      const { default: jsPDF } = await import('jspdf');

      // Ambil pengaturan gambar latar sertifikat
      const resP = await fetch('/api/pengaturan', { cache: 'no-store' });
      const pengaturan = await resP.json();

      const readyTeams = dataTampil.filter(t => t.is_sertifikat_siap === 1);
      if (readyTeams.length === 0) {
        import('react-hot-toast').then(m => m.default.error("Tidak Ada Sertifikat Yang Siap"));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const loadImg = (src) => new Promise(r => { const i = new Image(); i.crossOrigin = "anonymous"; i.src = src; i.onload = () => r(i); });

      // Load template background sertifikat
      const [tP, tJ] = await Promise.all([
        pengaturan.sertifikat_peserta ? loadImg(pengaturan.sertifikat_peserta) : null,
        pengaturan.sertifikat_juara ? loadImg(pengaturan.sertifikat_juara) : null
      ]);

      const cP = pengaturan.sertifikat_config_peserta ? JSON.parse(pengaturan.sertifikat_config_peserta) : { y_nomor: 33, y_nama: 48, y_status: 62, size_nomor: 11, size_nama: 32, size_status: 18 };
      const cJ = pengaturan.sertifikat_config_juara ? JSON.parse(pengaturan.sertifikat_config_juara) : { y_nomor: 33, y_nama: 48, y_status: 62, size_nomor: 11, size_nama: 32, size_status: 18 };

      const selectedFontPeserta = cP.font_nama || 'Cinzel';
      const selectedFontJuara = cJ.font_nama || 'Cinzel';

      // Muat font dinamis menggunakan helper dari pdfHelper
      await muatFontSertifikat([selectedFontPeserta, selectedFontJuara]);

      let pdf = null;
      for (const team of readyTeams) {
        const members = [team.nama_peserta1, team.nama_peserta2, team.nama_peserta3].filter(n => n && n.trim() !== "");
        for (let i = 0; i < members.length; i++) {

          // Gambar Sertifikat Peserta
          if (tP && (tipe === 'SEMUA' || tipe === 'PESERTA')) {
            canvas.width = tP.width; canvas.height = tP.height; ctx.drawImage(tP, 0, 0);
            gambarTeksSertifikat(ctx, tP, cP, {
              nama: members[i], namaLomba: team.nama_lomba, jenis: 'PESERTA',
              peringkat: null, pengaturan, indexInTeam: i,
              globalStartIdx: team.global_start_idx_peserta, isWinnerCert: false
            });
            if (!pdf) pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [tP.width, tP.height] });
            else pdf.addPage([tP.width, tP.height], 'landscape');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, tP.width, tP.height);
          }

          // Gambar Sertifikat Juara
          if (team.peringkat && tJ && (tipe === 'SEMUA' || tipe === 'JUARA')) {
            canvas.width = tJ.width; canvas.height = tJ.height; ctx.drawImage(tJ, 0, 0);
            gambarTeksSertifikat(ctx, tJ, cJ, {
              nama: members[i], namaLomba: team.nama_lomba, jenis: 'JUARA',
              peringkat: team.peringkat, pengaturan, indexInTeam: i,
              globalStartIdx: team.global_start_idx_juara, isWinnerCert: true
            });
            if (!pdf) pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [tJ.width, tJ.height] });
            else pdf.addPage([tJ.width, tJ.height], 'landscape');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, tJ.width, tJ.height);
          }
        }
      }
      if (pdf) pdf.save(`Sertifikat_${formatJudul(tipe)}_${formatJudul(kategoriTerpilih)}.pdf`);
      import('react-hot-toast').then(m => m.default.success("Unduhan Selesai!"));
    } catch (err) {
      console.error(err);
    } finally {
      setSedangUnduh(false);
    }
  };

  // Fungsi Unduh Massal Arsip Sertifikat format ZIP
  const tanganiUnduhZIP = async () => {
    setSedangUnduhZIP(true);
    setApakahMenuUnduhTerbuka(false);

    // Fungsi pembantu untuk memuat script JSZip
    const muatScript = (src) => new Promise((resolve, reject) => {
      if (window.JSZip) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    try {
      const { default: jsPDF } = await import('jspdf');

      // Muat JSZip dari CDN
      await muatScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      const JSZip = window.JSZip;
      const zip = new JSZip();

      // Ambil pengaturan gambar latar sertifikat
      const resP = await fetch('/api/pengaturan', { cache: 'no-store' });
      const pengaturan = await resP.json();

      // Ambil seluruh tim yang sertifikatnya siap dari semua kategori
      const readyTeams = daftarPemenang.filter(t => t.is_sertifikat_siap === 1);

      if (readyTeams.length === 0) {
        import('react-hot-toast').then(m => m.default.error("Tidak Ada Sertifikat Yang Siap Diarsip"));
        return;
      }

      setProgressZIP({ current: 0, total: readyTeams.length });

      // Fungsi untuk memuat font
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const loadImg = (src) => new Promise(r => { const i = new Image(); i.crossOrigin = "anonymous"; i.src = src; i.onload = () => r(i); });

      // Muat gambar latar sertifikat
      const [tP, tJ] = await Promise.all([
        pengaturan.sertifikat_peserta ? loadImg(pengaturan.sertifikat_peserta) : null,
        pengaturan.sertifikat_juara ? loadImg(pengaturan.sertifikat_juara) : null
      ]);

      // Ambil konfigurasi posisi dan ukuran teks dari database
      const cP = pengaturan.sertifikat_config_peserta ? JSON.parse(pengaturan.sertifikat_config_peserta) : { y_nomor: 33, y_nama: 48, y_status: 62, size_nomor: 11, size_nama: 32, size_status: 18 };
      const cJ = pengaturan.sertifikat_config_juara ? JSON.parse(pengaturan.sertifikat_config_juara) : { y_nomor: 33, y_nama: 48, y_status: 62, size_nomor: 11, size_nama: 32, size_status: 18 };

      const selectedFontPeserta = cP.font_nama || 'Cinzel';
      const selectedFontJuara = cJ.font_nama || 'Cinzel';

      // Muat font dinamis menggunakan helper dari pdfHelper
      await muatFontSertifikat([selectedFontPeserta, selectedFontJuara]);

      const folderJuara = zip.folder("JUARA");

      // Generate sertifikat tiap anggota dan kelompokkan ke folder ZIP
      for (let tIdx = 0; tIdx < readyTeams.length; tIdx++) {
        const team = readyTeams[tIdx];
        const namaLomba = (team.nama_lomba || "LAINNYA").toUpperCase();
        const folderLomba = zip.folder(namaLomba);
        const members = [team.nama_peserta1, team.nama_peserta2, team.nama_peserta3].filter(n => n && n.trim() !== "");

        for (let i = 0; i < members.length; i++) {
          const namaFile = `${members[i].replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;

          // Sertifikat Peserta (Masuk ke Folder Kategori Lomba)
          if (tP) {
            canvas.width = tP.width; canvas.height = tP.height; ctx.drawImage(tP, 0, 0);
            gambarTeksSertifikat(ctx, tP, cP, {
              nama: members[i], namaLomba: team.nama_lomba, jenis: 'PESERTA',
              peringkat: null, pengaturan, indexInTeam: i,
              globalStartIdx: team.global_start_idx_peserta, isWinnerCert: false
            });
            const pdfP = new jsPDF({ orientation: 'landscape', unit: 'px', format: [tP.width, tP.height] });
            pdfP.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, tP.width, tP.height);
            folderLomba.file(namaFile, pdfP.output('arraybuffer'));
          }

          // Sertifikat Juara (Masuk ke Folder khusus JUARA)
          if (team.peringkat && tJ) {
            canvas.width = tJ.width; canvas.height = tJ.height; ctx.drawImage(tJ, 0, 0);
            gambarTeksSertifikat(ctx, tJ, cJ, {
              nama: members[i], namaLomba: team.nama_lomba, jenis: 'JUARA',
              peringkat: team.peringkat, pengaturan, indexInTeam: i,
              globalStartIdx: team.global_start_idx_juara, isWinnerCert: true
            });
            const pdfJ = new jsPDF({ orientation: 'landscape', unit: 'px', format: [tJ.width, tJ.height] });
            pdfJ.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, tJ.width, tJ.height);
            folderJuara.file(namaFile, pdfJ.output('arraybuffer'));
          }
        }
        setProgressZIP(prev => ({ ...prev, current: tIdx + 1 }));
      }

      const content = await zip.generateAsync({ type: "blob" });
      const TAHUN_SKRG = new Date().getFullYear();

      // Download berkas ZIP
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sertifikat_SGDRC_${TAHUN_SKRG}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      import('react-hot-toast').then(m => m.default.success("Arsip ZIP Berhasil Dibuat!"));
    } catch (err) {
      console.error(err);
      import('react-hot-toast').then(m => m.default.error("Gagal Membuat ZIP: " + err.message));
    } finally {
      setSedangUnduhZIP(false);
    }
  };

  // Fungsi Simpan Konfigurasi Juara & Sertifikat Ke Database
  const simpanSemua = async () => {
    if (daftarPemenang.length === 0) {
      import('react-hot-toast').then(m => m.default.error("Tidak ada data untuk disimpan"));
      return;
    }

    // Ubah state sedang menyimpan menjadi true
    setSedangMenyimpan(true);
    try {
      const promises = daftarPemenang.map(p => {
        const fd = new FormData();
        fd.append('id', p.id);
        fd.append('nama_tim', p.nama_tim || '');
        fd.append('nama_peserta1', p.nama_peserta1);
        fd.append('nama_peserta2', p.nama_peserta2 || '');
        fd.append('nama_peserta3', p.nama_peserta3 || '');
        fd.append('asal_instansi', p.asal_instansi);
        fd.append('whatsapp', p.whatsapp);
        fd.append('jenjang', p.jenjang);
        fd.append('peringkat', p.peringkat || '');
        fd.append('is_sertifikat_siap', p.is_sertifikat_siap || 0);

        // Request PUT dengan token otomatis
        return fetchDenganToken('/api/admin/peserta', {
          method: 'PUT',
          body: fd
        });
      });
      await Promise.all(promises);
      import('react-hot-toast').then(m => m.default.success("Data Berhasil Diperbarui!"));
    } catch (err) {
      import('react-hot-toast').then(m => m.default.error("Gagal Menyimpan Data"));
    } finally {
      setSedangMenyimpan(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] font-montserrat flex flex-col overflow-hidden">
      <style>{`
        @media (min-width: 768px) and (max-width: 1024px) {
          .winner-filters-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
          }
          .winner-filters-grid > :nth-child(3) {
            grid-column: span 2 !important;
          }
        }
      `}</style>

      {/* Navbar Atas */}
      <NavbarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} setApakahSidebarTerbuka={setApakahSidebarTerbuka} apakahProfilTerbuka={apakahProfilTerbuka} setApakahProfilTerbuka={setApakahProfilTerbuka} />

      <div className="flex flex-1 pt-14 overflow-hidden">
        {/* Sidebar Kiri */}
        <SidebarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} />

        {/* Konten Utama */}
        <main suppressHydrationWarning className={`flex-1 overflow-y-auto peserta-scrollbar p-4 md:p-8 transition-all duration-500 ${apakahSidebarTerbuka ? 'lg:ml-56' : 'ml-0'}`}>
          <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Judul */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase leading-tight">Manajemen Pemenang</h1>
            </div>

            {/* Container Filter dan Aksi*/}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 winner-filters-grid">
              {/* ContainerKategori Lomba */}
              <div className="relative group">
                {/* Icon */}
                <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-[#16B9FF]" size={14} />

                 {/* Dropdown */}
                <select suppressHydrationWarning value={kategoriTerpilih} onChange={(e) => setKategoriTerpilih(e.target.value)} className="w-full pl-9 pr-10 py-2.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[11.5px] lg:text-[10.8px] xl:text-[11.5px] 2xl:text-[12.2px] font-bold text-slate-950 appearance-none shadow-sm uppercase">
                  {daftarLomba.map(lomba => (
                    <option key={lomba.id} value={lomba.nama.toUpperCase()}>
                      {lomba.nama.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(' ')}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-950 pointer-events-none" size={14} />
              </div>

              {/* Pencarian */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-950 group-focus-within:text-[#16B9FF] transition-colors" size={14} />
                <input suppressHydrationWarning type="text" placeholder="Cari Nama..." value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[11.5px] lg:text-[10.8px] xl:text-[11.5px] 2xl:text-[12.2px] font-bold text-slate-950 placeholder:text-slate-950 shadow-sm" />
              </div>

              {/* Container Tombol Aksi */}
              <div className="flex gap-2 h-full">
                {/* Tombol Aktifkan / Nonaktifkan Semua Sertifikat */}
                <button
                  suppressHydrationWarning
                  onClick={() => {
                    const targetState = apakahSemuaAktif ? 0 : 1;
                    setDaftarPemenang(prev => prev.map(p => (p.nama_lomba || "").toUpperCase() === kategoriTerpilih.toUpperCase() ? { ...p, is_sertifikat_siap: targetState } : p));
                    import('react-hot-toast').then(m => m.default.success(`Sertifikat ${apakahSemuaAktif ? 'Dinonaktifkan' : 'Diaktifkan'}!`));
                  }}
                  className={`flex-1 ${apakahSemuaAktif ? 'bg-slate-400 hover:bg-slate-500' : 'bg-emerald-500 hover:bg-emerald-600'} text-white px-2 py-2.5 rounded-xl text-[10.5px] lg:text-[10px] xl:text-[11px] 2xl:text-[12px] font-black tracking-wide transition-all flex items-center justify-center gap-1 active:scale-95 uppercase`}
                >
                  <Award size={13} /> {apakahSemuaAktif ? 'Nonaktif' : 'Aktif'}
                </button>

                {/* Container Unduh Sertifikat */}
                <div className="relative flex-1">
                  {/* Dropdown Menu Unduh */}
                  <button
                    suppressHydrationWarning
                    onClick={() => setApakahMenuUnduhTerbuka(!apakahMenuUnduhTerbuka)}
                    disabled={sedangUnduh || sedangUnduhZIP}
                    className="w-full h-full bg-[#E40011] hover:bg-red-700 text-white px-2 py-2.5 rounded-xl text-[10.5px] lg:text-[10px] xl:text-[11px] 2xl:text-[12px] font-black tracking-wide transition-all flex items-center justify-center gap-1 shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 uppercase"
                  >
                    {sedangUnduh || sedangUnduhZIP ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{sedangUnduhZIP ? `${progressZIP.current}/${progressZIP.total}` : ''}</span>
                      </div>
                    ) : (
                      <>
                        <Download size={13} />
                        Unduh
                      </>
                    )}
                  </button>

                  {/* Dropdown Menu Unduh Terbuka*/}
                  {apakahMenuUnduhTerbuka && (
                    <>
                      <div className="fixed inset-0 z-[90]" onClick={() => setApakahMenuUnduhTerbuka(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-max bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] py-1 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                        <button onClick={() => tanganiUnduhMasal('PESERTA')} className="block w-full text-left px-5 py-2.5 text-[11px] font-semibold text-slate-950 hover:text-[#16B9FF] hover:bg-slate-50 transition-all border-b border-slate-50 whitespace-nowrap">Hanya Peserta (PDF)</button>
                        <button onClick={() => tanganiUnduhMasal('JUARA')} className="block w-full text-left px-5 py-2.5 text-[11px] font-semibold text-slate-950 hover:text-[#16B9FF] hover:bg-slate-50 transition-all border-b border-slate-50 whitespace-nowrap">Hanya Juara (PDF)</button>
                        <button onClick={tanganiUnduhZIP} className="block w-full text-left px-5 py-2.5 text-[11px] font-semibold text-slate-950 hover:text-emerald-600 hover:bg-slate-50 transition-all whitespace-nowrap">Arsip Sertifikat (ZIP)</button>
                      </div>
                    </>
                  )}
                </div>

                {/* Tombol Simpan Konfigurasi */}
                <button suppressHydrationWarning onClick={simpanSemua} disabled={sedangMenyimpan} className="flex-1 bg-[#0B255D] hover:bg-blue-500 text-white px-2 py-2.5 rounded-xl text-[10.5px] lg:text-[10px] xl:text-[11px] 2xl:text-[12px] font-black tracking-wide transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 uppercase">
                  {sedangMenyimpan ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={13} />}
                  Simpan
                </button>
              </div>
            </div>

            {/* Container Tabel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[850px]">
 
                   {/* Header Tabel */}
                  <thead>
                    <tr className="bg-[#0B255D] text-white text-[10.8px] lg:text-[10px] xl:text-[10.8px] 2xl:text-[11.8px] font-black uppercase tracking-wide whitespace-nowrap">
                      <th className="px-8 py-3.5 border-r border-white/5 w-20 text-center font-black">No</th>
                      <th className="px-8 py-3.5 border-r border-white/5 text-left font-black">Nama Tim / Peserta</th>
                      <th className="px-8 py-3.5 border-r border-white/5 text-left font-black">Instansi</th>
                      <th className="px-8 py-3.5 border-r border-white/5 text-center font-black">Juara</th>
                      <th className="px-8 py-3.5 text-center w-40 font-black">Sertifikat</th>
                    </tr>
                  </thead>
 
                  {/* Isi Tabel */}
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="5" className="px-8 py-20 text-center"><div className="w-8 h-8 border-4 border-[#16B9FF] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Memuat...</p></td></tr>
                    ) : dataTampil.length > 0 ? (
                      dataTampil.map((tim, index) => (
                        <tr key={tim.id} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                          <td className="px-8 py-3 text-center"><span className="text-[11.7px] lg:text-[11.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold text-slate-950">#{index + 1}</span></td>
                          <td className="px-8 py-3"><h4 className="text-[12.5px] lg:text-[11.7px] xl:text-[12.5px] 2xl:text-[13.5px] font-bold text-[#0B255D] uppercase tracking-tight">{tim.nama_tim || tim.nama_peserta1}</h4></td>
                          <td className="px-8 py-3 text-[11.7px] lg:text-[11.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-semibold text-slate-950 uppercase">{tim.asal_instansi}</td>
 
                          {/* Dropdown Status Juara */}
                          <td className="px-8 py-3 border-r border-slate-100">
                            <div className="flex justify-center">
                              {/* Opsi Klasifikasi Juara */}
                              <select value={tim.peringkat || ""} onChange={(e) => handleSetJuara(tim.id, e.target.value)} className="pl-3 pr-8 py-1.5 rounded-lg text-[10.3px] lg:text-[9.5px] xl:text-[10.3px] 2xl:text-[11.3px] font-bold uppercase tracking-wider outline-none border-2 bg-white border-slate-200 text-slate-950">
                                <option value="">Bukan Juara</option>
                                <option value="Juara 1">Juara 1</option>
                                <option value="Juara 2">Juara 2</option>
                                <option value="Juara 3">Juara 3</option>
                              </select>
                            </div>
                          </td>
 
                          {/* Status Sertifikat */}
                          <td className="px-8 py-3 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={tim.is_sertifikat_siap === 1} onChange={(e) => handleSetSertifikat(tim.id, e.target.checked ? 1 : 0)} />
                              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                          </td>
                        </tr>
                      ))
                    ) : daftarPemenang.length === 0 ? (
                      <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-500 font-bold uppercase text-[11px]">Data Belum Ada</td></tr>
                    ) : (
                      <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-500 font-bold uppercase text-[11px]">Data Tidak Ditemukan</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManajemenJuara;
