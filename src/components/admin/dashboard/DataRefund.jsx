'use client';
// Import React, Icon dan Komponen
import React, { useState, useEffect } from 'react';
import { Search, FileText, Loader2, RotateCcw } from 'lucide-react';
import NavbarAdmin from '../navigasi/NavbarAdmin';
import SidebarAdmin from '../navigasi/SidebarAdmin';
import Verifikasi from '../peserta/Verifikasi';
import toast from 'react-hot-toast';

// Import Element Tabel
import { TableBase } from '../../element/TableBase';

// Import Utility
import { fetchDenganToken } from '../../../lib/apiClient';
import useSidebar from '../../../hooks/useSidebar';

// Komponen Utama Data Refund
const DataRefund = () => {
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useSidebar('sidebarAdmin');
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);
  const [daftarPeserta, setDaftarPeserta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kataKunci, setKataKunci] = useState('');

  // State Verfikasi (Melihat Bukti)
  const [apakahVerifikasiTerbuka, setApakahVerifikasiTerbuka] = useState(false);
  const [dataVerifikasi, setDataVerifikasi] = useState(null);

  // Fungsi Ambil Data Refund
  const ambilDataRefund = async () => {
    setLoading(true);

    try {
      const res = await fetchDenganToken('/api/admin/peserta');

      // Jika Berhasil
      if (res.ok) {
        const data = await res.json();
        const dataRefund = data.filter(d => d.status_pendaftaran === 'refund');
        setDaftarPeserta(dataRefund);
      }

      // Jika Error Server
    } catch (err) {
      toast.error("Gagal mengambil data refund");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ambilDataRefund(); }, []);



  // Filter Data Yang Ditampilkan
  const dataTampil = daftarPeserta.filter(p =>
    (p.nama_tim || p.nama_peserta1 || "").toLowerCase().includes(kataKunci.toLowerCase()) ||
    (p.asal_instansi || "").toLowerCase().includes(kataKunci.toLowerCase()) ||
    (p.nama_lomba || "").toLowerCase().includes(kataKunci.toLowerCase())
  );

  return (
    // Halaman Bagian Data Refund
    <div className="h-screen bg-[#F8FAFC] font-montserrat flex flex-col overflow-hidden">
      <NavbarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} setApakahSidebarTerbuka={setApakahSidebarTerbuka} apakahProfilTerbuka={apakahProfilTerbuka} setApakahProfilTerbuka={setApakahProfilTerbuka} />
      <div className="flex flex-1 pt-14 overflow-hidden">
        <SidebarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} />

        {/* Konten Main */}
        <main suppressHydrationWarning className={`flex-1 overflow-y-auto peserta-scrollbar p-4 md:p-8 transition-all duration-500 ${apakahSidebarTerbuka ? 'lg:ml-56' : 'ml-0'}`}>
          <div className="max-w-[1100px] mx-auto space-y-8">

            {/* Container Judul dan Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Judul */}
              <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Data Refund</h1>

              {/* Search */}
              <div className="relative group w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#16B9FF] transition-colors" size={13} />
                <input type="text" placeholder="Cari Data Refund..." value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} className="pl-9 pr-4 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[11.5px] lg:text-[11px] font-bold text-slate-950 placeholder:text-slate-600 shadow-sm w-full" />
              </div>

            </div>

            {/* Container Tabel */}
            <TableBase
              loading={loading}
              loadingText="Memuat Data Refund..."
              isEmpty={daftarPeserta.length === 0 && kataKunci === ''}
              emptyText="Data Belum Ada"
              notFound={dataTampil.length === 0 && (daftarPeserta.length > 0 || kataKunci !== '')}
              notFoundText="Data tidak ditemukan"
              minWidth="w-full"
              headers={[
                { label: <div className="min-w-[110px] text-center">Jenis Lomba</div> },
                { label: <div className="min-w-[140px] text-center">Nama Tim / Peserta</div> },
                { label: <div className="min-w-[90px] text-center whitespace-nowrap">Nomor WhatsApp</div> },
                { label: <div className="min-w-[130px] text-center">Asal Instansi</div> },
                { label: <div className="min-w-[50px] text-center">Bukti</div> }
              ]}
            >
              {dataTampil.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  {/* Jenis Lomba */}
                  <td className="px-6 py-2 border-r border-slate-200 text-center">
                    <div className="min-w-[110px] whitespace-nowrap text-[12.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-black text-[#16B9FF] uppercase tracking-normal leading-relaxed">
                      {p.nama_lomba}
                    </div>
                  </td>

                  {/* Nama Tim */}
                  <td className="px-6 py-2 border-r border-slate-200 text-left">
                    <div className="min-w-[140px] text-[12.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold text-slate-950 uppercase leading-relaxed">{p.nama_tim || p.nama_peserta1}</div>
                  </td>

                  {/* Nomor WhatsApp */}
                  <td className="px-6 py-2 border-r border-slate-200 text-center">
                    <div className="min-w-[90px] text-[12.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold text-slate-950 leading-relaxed">{p.whatsapp}</div>
                  </td>

                  {/* Asal Instansi */}
                  <td className="px-6 py-2 border-r border-slate-200 text-left">
                    <div className="min-w-[130px] text-[12.1px] xl:text-[11.7px] 2xl:text-[12.7px] font-bold text-slate-950 uppercase leading-relaxed">{p.asal_instansi}</div>
                  </td>

                  {/* Tombol Lihat Bukti */}
                  <td className="px-6 py-2 text-center">
                    <div className="min-w-[50px] flex justify-center">
                      <button
                        onClick={() => {
                          setDataVerifikasi({
                            id: p.id,
                            nama: p.nama_tim || p.nama_peserta1,
                            lomba: p.nama_lomba,
                            bukti: p.file_bukti_bayar,
                            buktiRefund: p.file_bukti_refund,
                            status: 'Refunded'
                          });
                          setApakahVerifikasiTerbuka(true);
                        }}
                        className="w-7 h-7 inline-flex items-center justify-center bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 rounded-md transition-all border border-orange-500/20 mx-auto"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </TableBase>

          </div>
        </main>
      </div>

      {/* Melihat Bukti Refund */}
      <Verifikasi
        apakahTerbuka={apakahVerifikasiTerbuka}
        setApakahTerbuka={setApakahVerifikasiTerbuka}
        dataPeserta={dataVerifikasi}
        onSuccess={ambilDataRefund}
      />
    </div>
  );
};

export default DataRefund;
