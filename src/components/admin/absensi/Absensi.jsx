'use client';
import React, { useState, useEffect, useRef } from 'react';
import NavbarAdmin from '../navigasi/NavbarAdmin';
import SidebarAdmin from '../navigasi/SidebarAdmin';
import useSidebar from '../../../hooks/useSidebar';
import KartuStatistik from './KartuStatistik';
import BarisKontrol from './BarisKontrol';
import TabelAbsensi from './TabelAbsensi';
import { X, CheckCircle2, XCircle, Camera } from 'lucide-react';
import { eksporExcelAbsensi } from '@/lib/excelAbsensi';

const Absensi = () => {
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useSidebar();
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);

  // State Data Absensi & Lomba
  const [daftarAbsensi, setDaftarAbsensi] = useState([]);
  const [daftarLomba, setDaftarLomba] = useState([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [kataKunciCari, setKataKunciCari] = useState('');
  const [lombaPilihan, setLombaPilihan] = useState('semua');

  // State Scanner Kamera Fullscreen Standby
  const [apakahScannerAktif, setApakahScannerAktif] = useState(false);
  const [pesanNotifikasiScan, setPesanNotifikasiScan] = useState(null);
  const [sedangProsesScan, setSedangProsesScan] = useState(false);

  const html5QrCodeRef = useRef(null);

  // Helper mengambil token auth admin
  const ambilHeadersAuth = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token_sgdrc') : '';
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Fungsi memuat data absensi dari API
  const ambilDataAbsensi = async () => {
    try {
      setSedangMemuat(true);
      const res = await fetch('/api/admin/absensi?t=' + Date.now(), {
        headers: ambilHeadersAuth(),
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.absensi)) {
          setDaftarAbsensi(data.absensi);
          if (Array.isArray(data.daftarLomba)) {
            setDaftarLomba(data.daftarLomba);
          }
        } else if (Array.isArray(data)) {
          setDaftarAbsensi(data);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data absensi:', err);
    } finally {
      setSedangMemuat(false);
    }
  };

  useEffect(() => {
    ambilDataAbsensi();
  }, []);

  // Memulai dan menghentikan scanner kamera secara langsung (Live Camera Direct)
  useEffect(() => {
    let timerInit = null;

    if (apakahScannerAktif) {
      document.body.style.overflow = 'hidden';

      timerInit = setTimeout(() => {
        const targetElement = document.getElementById('qr-reader-container-fullscreen');
        if (!targetElement) return;

        import('html5-qrcode').then(({ Html5Qrcode }) => {
          const html5QrCode = new Html5Qrcode('qr-reader-container-fullscreen');
          html5QrCodeRef.current = html5QrCode;

          html5QrCode.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 300, height: 300 } },
            async (decodedText) => {
              if (sedangProsesScan) return;
              setSedangProsesScan(true);

              // Audio beep notifikasi
              try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                osc.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.2);
              } catch (e) { }

              // Kirim absensi ke API dari Scanner Kamera
              try {
                const res = await fetch('/api/admin/absensi', {
                  method: 'POST',
                  headers: ambilHeadersAuth(),
                  body: JSON.stringify({ idPendaftaran: decodedText })
                });

                const hasil = await res.json();
                if (res.ok && hasil.sukses) {
                  setPesanNotifikasiScan({
                    tipe: 'sukses',
                    id: hasil.data.idPendaftaran,
                    nama: hasil.data.namaTim,
                    lomba: hasil.data.namaLomba,
                    teks: 'ABSENSI BERHASIL'
                  });
                  ambilDataAbsensi();
                } else {
                  setPesanNotifikasiScan({
                    tipe: 'gagal',
                    id: decodedText,
                    teks: hasil.error || 'Data pendaftaran terverifikasi tidak ditemukan'
                  });
                }
              } catch (err) {
                setPesanNotifikasiScan({
                  tipe: 'gagal',
                  id: decodedText,
                  teks: 'Terjadi kesalahan jaringan'
                });
              } finally {
                setTimeout(() => {
                  setSedangProsesScan(false);
                }, 2500);

                setTimeout(() => {
                  setPesanNotifikasiScan(null);
                }, 5000);
              }
            },
            (errorMessage) => { }
          ).catch(err => {
            console.error('Kamera gagal dinyalakan:', err);
          });
        });
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (timerInit) clearTimeout(timerInit);
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current.clear();
          }).catch(() => { });
        } catch (e) { }
      }
    };
  }, [apakahScannerAktif]);

  // Fungsi toggle status kehadiran manual
  const tanganiToggleHadir = async (id, statusSekarang) => {
    const statusBaru = statusSekarang === 'hadir' ? 'belum_hadir' : 'hadir';
    try {
      const res = await fetch('/api/admin/absensi', {
        method: 'POST',
        headers: ambilHeadersAuth(),
        body: JSON.stringify({ id, statusKehadiran: statusBaru })
      });
      if (res.ok) {
        ambilDataAbsensi();
      }
    } catch (err) {
      console.error('Gagal update kehadiran:', err);
    }
  };

  // Filter data berdasarkan cabang lomba & kata kunci pencarian
  const dataTersaring = daftarAbsensi.filter(item => {
    const cocokLomba = lombaPilihan === 'semua' || item.namaLomba === lombaPilihan;
    const kata = kataKunciCari.toLowerCase();
    const cocokCari =
      item.idPendaftaran.toLowerCase().includes(kata) ||
      item.namaTim.toLowerCase().includes(kata) ||
      item.peserta1.toLowerCase().includes(kata) ||
      item.peserta2.toLowerCase().includes(kata) ||
      item.peserta3.toLowerCase().includes(kata) ||
      item.asalInstansi.toLowerCase().includes(kata);

    return cocokLomba && cocokCari;
  });

  // Hitung statistik untuk data pilihan lomba
  const dataStatistikLomba = lombaPilihan === 'semua' ? daftarAbsensi : daftarAbsensi.filter(i => i.namaLomba === lombaPilihan);
  const totalPendaftar = dataStatistikLomba.length;
  const totalHadir = dataStatistikLomba.filter(i => i.statusKehadiran === 'hadir').length;
  const totalBelumHadir = totalPendaftar - totalHadir;

  const persenHadir = totalPendaftar > 0 ? ((totalHadir / totalPendaftar) * 100).toFixed(1) : 0;
  const persenBelumHadir = totalPendaftar > 0 ? ((totalBelumHadir / totalPendaftar) * 100).toFixed(1) : 0;

  const apakahIndividu = dataStatistikLomba.length > 0 && dataStatistikLomba.every(i => i.apakahIndividu);

  /* Ekspor Rekap Presensi Absensi ke File Excel Multi-Sheet */
  const tanganiEksporExcel = () => {
    if (daftarAbsensi.length === 0) {
      alert('Tidak ada data absensi untuk diekspor.');
      return;
    }
    eksporExcelAbsensi({ daftarAbsensi, daftarLomba, lombaPilihan });
  };

  // Daftar nama lomba gabungan dari database & data pendaftaran
  const daftarNamaLombaUnik = Array.from(
    new Set([
      ...daftarLomba.map(l => l.nama),
      ...daftarAbsensi.map(a => a.namaLomba)
    ])
  ).filter(Boolean);

  // Rekap statistik per lomba untuk tampilan "Semua Lomba"
  const rekapPerLomba = daftarNamaLombaUnik.map(namaLomba => {
    const items = daftarAbsensi.filter(a => a.namaLomba === namaLomba);
    const total = items.length;
    const hadir = items.filter(a => a.statusKehadiran === 'hadir').length;
    const belum = total - hadir;
    return { namaLomba, total, hadir, belum };
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pt-14">

      {/* MODAL SCANNER LIGHT MODE */}
      {apakahScannerAktif && (
        <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-start pt-6 md:pt-8 px-4 pb-8 animate-in fade-in duration-300">

          {/* Wadah 1 Kotak Utuh Scanner */}
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col">

            {/* Header Kotak */}
            <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 text-[#0066da] rounded-lg">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Scan QR Absensi</h3>
              </div>
              <button
                onClick={() => setApakahScannerAktif(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Area Kamera Live Stream (Direct Html5Qrcode Stream) */}
            <div className="bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] max-h-[360px]">
              <div id="qr-reader-container-fullscreen" className="w-full h-full"></div>
            </div>

            {/* Area Status Hasil Scan (Tampil Hanya Saat Ada Notifikasi Scan) */}
            {pesanNotifikasiScan && (
              <div className={`p-4 md:p-5 pb-5 md:pb-6 border-t text-left shrink-0 transition-all rounded-b-xl ${pesanNotifikasiScan.tipe === 'sukses'
                  ? 'bg-emerald-50/90 border-t-emerald-200 text-emerald-950'
                  : 'bg-rose-50/90 border-t-rose-200 text-rose-950'
                }`}>
                <div className="flex items-center gap-3.5">
                  {pesanNotifikasiScan.tipe === 'sukses' ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black uppercase tracking-wide ${pesanNotifikasiScan.tipe === 'sukses' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                      {pesanNotifikasiScan.teks}
                    </p>
                    <h4 className="text-sm font-bold text-slate-950 truncate mt-1">
                      {pesanNotifikasiScan.nama || pesanNotifikasiScan.id} {pesanNotifikasiScan.lomba ? `- ${pesanNotifikasiScan.lomba}` : ''}
                    </h4>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Navigasi Header Admin */}
      <NavbarAdmin
        apakahSidebarTerbuka={apakahSidebarTerbuka}
        setApakahSidebarTerbuka={setApakahSidebarTerbuka}
        apakahProfilTerbuka={apakahProfilTerbuka}
        setApakahProfilTerbuka={setApakahProfilTerbuka}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} />

        <main suppressHydrationWarning className={`flex-1 overflow-y-auto px-4 md:px-8 pt-8 pb-10 transition-all duration-500 ${apakahSidebarTerbuka ? 'lg:ml-56' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Baris Kontrol Atas */}
            <BarisKontrol
              lombaPilihan={lombaPilihan}
              setLombaPilihan={setLombaPilihan}
              daftarNamaLombaUnik={daftarNamaLombaUnik}
              daftarAbsensi={daftarAbsensi}
              kataKunciCari={kataKunciCari}
              setKataKunciCari={setKataKunciCari}
              apakahScannerAktif={apakahScannerAktif}
              setApakahScannerAktif={setApakahScannerAktif}
              sedangMemuat={sedangMemuat}
              tanganiEksporExcel={tanganiEksporExcel}
            />

            {/* Kartu Statistik Kehadiran */}
            <KartuStatistik
              totalPendaftar={totalPendaftar}
              totalHadir={totalHadir}
              totalBelumHadir={totalBelumHadir}
              persenHadir={persenHadir}
              persenBelumHadir={persenBelumHadir}
              apakahIndividu={apakahIndividu}
            />

            {/* Tabel Absensi */}
            <TabelAbsensi
              lombaPilihan={lombaPilihan}
              setLombaPilihan={setLombaPilihan}
              sedangMemuat={sedangMemuat}
              daftarLomba={daftarLomba}
              dataTersaring={dataTersaring}
              rekapPerLomba={rekapPerLomba}
              tanganiToggleHadir={tanganiToggleHadir}
            />

          </div>
        </main>
      </div>

    </div>
  );
};

export default Absensi;
