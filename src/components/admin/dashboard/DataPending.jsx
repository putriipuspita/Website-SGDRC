'use client';
// Import React, Icon dan Komponen
import React, { useState, useEffect } from 'react';
import { Search, FileText, Loader2 } from 'lucide-react';
import NavbarAdmin from '../navigasi/NavbarAdmin';
import SidebarAdmin from '../navigasi/SidebarAdmin';
import Verifikasi from '../peserta/Verifikasi';

// Import Element Tabel
import { TableBase } from '../../element/TableBase';

// Import Utility
import { fetchDenganToken } from '../../../lib/apiClient';

// Komponen Utama Belum Terverifikasi
const DataPending = () => {
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useState(true);
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);
  const [daftarPeserta, setDaftarPeserta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kataKunci, setKataKunci] = useState('');

  // State Data Verifikasi
  const [apakahVerifikasiTerbuka, setApakahVerifikasiTerbuka] = useState(false);
  const [dataVerifikasi, setDataVerifikasi] = useState(null);

  // Fungsi Mengambil Data yang Belum Terverifikasi
  const ambilDataPending = async () => {
    setLoading(true);

    // Ambil Data dari API menggunakan fetchDenganToken
    try {
      const res = await fetchDenganToken('/api/admin/peserta');

      // Jika Berhasil
      if (res.ok) {
        const data = await res.json();
        const dataPending = data.filter(d => d.status_pendaftaran === 'pending' || d.status_pendaftaran === 'waiting');
        setDaftarPeserta(dataPending);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ambilDataPending(); }, []);

  // Filter Data yang Tampil di Tabel
  const dataTampil = daftarPeserta.filter(p =>
    (p.nama_tim || p.nama_peserta1 || "").toLowerCase().includes(kataKunci.toLowerCase()) ||
    (p.asal_instansi || "").toLowerCase().includes(kataKunci.toLowerCase()) ||
    (p.nama_lomba || "").toLowerCase().includes(kataKunci.toLowerCase())
  );

  return (
    // Halaman Bagian Data Belum Terverifikasi
    <div className="h-screen bg-[#F8FAFC] font-montserrat flex flex-col overflow-hidden">
      <NavbarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} setApakahSidebarTerbuka={setApakahSidebarTerbuka} apakahProfilTerbuka={apakahProfilTerbuka} setApakahProfilTerbuka={setApakahProfilTerbuka} />
      <div className="flex flex-1 pt-14 overflow-hidden">
        <SidebarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} />

        {/* Container Konten */}
        <main className={`flex-1 overflow-y-auto peserta-scrollbar p-4 md:p-8 transition-all duration-500 ${apakahSidebarTerbuka ? 'md:ml-56' : 'ml-0'}`}>
          <div className="max-w-[1100px] mx-auto space-y-8">

            {/* Container Judul dan Cari */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Judul */}
              <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Antrian Verifikasi</h1>

              {/* Search */}
              <div className="relative group w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#16B9FF] transition-colors" size={13} />
                <input type="text" placeholder="Cari Antrian..." value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} className="pl-9 pr-4 py-2 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-[#16B9FF] transition-all text-[10.5px] font-bold text-slate-800 placeholder:text-slate-500 shadow-sm w-full" />
              </div>

            </div>

            {/* Container Tabel */}
            <TableBase
              loading={loading}
              loadingText="Memuat Antrian..."
              isEmpty={daftarPeserta.length === 0 && kataKunci === ''}
              emptyText="Data Belum Ada"
              notFound={dataTampil.length === 0 && (daftarPeserta.length > 0 || kataKunci !== '')}
              notFoundText="Data tidak ditemukan"
               headers={[
                { label: 'Jenis Lomba' },
                { label: 'Nama Tim / Peserta', className: 'min-w-[185px]' },
                { label: 'Nomor WhatsApp' },
                { label: 'Asal Instansi' },
                { label: 'Verifikasi' }
              ]}
            >
              {dataTampil.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  {/* Nama Lomba */}
                  <td className="px-6 py-2 border-r border-slate-200 text-center leading-relaxed">
                    <span className="text-[9.9px] font-black text-[#16B9FF] uppercase tracking-tight block text-center leading-normal">{p.nama_lomba}</span>
                  </td>

                  {/* Nama Tim */}
                  <td className="px-6 py-2 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed uppercase min-w-[185px]">
                    {p.nama_tim || p.nama_peserta1}
                  </td>

                  {/* Nomor WhatsApp */}
                  <td className="px-6 py-2 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed">
                    {p.whatsapp}
                  </td>

                  {/* Asal Instansi */}
                  <td className="px-6 py-2 border-r border-slate-200 text-[11.3px] font-bold text-slate-700 text-center leading-relaxed uppercase">
                    {p.asal_instansi}
                  </td>

                  {/* Tombol Verifikasi */}
                  <td className="px-6 py-2 text-center leading-relaxed">
                    <button
                      onClick={() => {
                        setDataVerifikasi({
                          id: p.id,
                          nama: p.nama_tim || p.nama_peserta1,
                          lomba: p.nama_lomba,
                          bukti: p.file_bukti_bayar
                        });
                        setApakahVerifikasiTerbuka(true);
                      }}
                      className="w-7 h-7 inline-flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-md transition-all border border-emerald-500/20 mx-auto"
                    >
                      <FileText size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </TableBase>

          </div>
        </main>
      </div>

      {/* Modal Verifikasi */}
      <Verifikasi
        apakahTerbuka={apakahVerifikasiTerbuka}
        setApakahTerbuka={setApakahVerifikasiTerbuka}
        dataPeserta={dataVerifikasi}
        onSuccess={ambilDataPending}
      />
    </div>
  );
};

export default DataPending;
