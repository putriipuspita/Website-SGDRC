'use client';
import React from 'react';
import { cekTipeLomba, formatJudul } from '../../../lib/formatHelper';

const TabelAbsensi = ({
  lombaPilihan,
  setLombaPilihan,
  sedangMemuat,
  daftarLomba = [],
  dataTersaring = [],
  rekapPerLomba = [],
  tanganiToggleHadir
}) => {
  // Format Waktu Jam dan Menit
  const formatJamMenit = (isoDate) => {
    if (!isoDate) return '-';
    const d = new Date(isoDate);
    const jam = String(d.getHours()).padStart(2, '0');
    const menit = String(d.getMinutes()).padStart(2, '0');
    return `${jam}:${menit}`;
  };

  // Normalisasi Teks Nama Lomba
  const bersihkan = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Info Lomba dan Slug
  const lombaInfo = daftarLomba.find(l => bersihkan(l.nama) === bersihkan(lombaPilihan));
  const slugLomba = (lombaPilihan || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  // Logika Tipe Lomba (Solo / Tim)
  const { apakahSolo: soloDariHelper, apakahKelompokMaks3: maks3DariHelper } = cekTipeLomba(slugLomba, lombaInfo);

  // Pengurutan Otomatis: Sudah Hadir (Urut Waktu Terbaru) di Paling Atas, Belum Hadir di Bawah
  const dataTersaringDiurutkan = [...dataTersaring].sort((a, b) => {
    const aHadir = a.statusKehadiran === 'hadir';
    const bHadir = b.statusKehadiran === 'hadir';

    if (aHadir && !bHadir) return -1; // a naik ke atas
    if (!aHadir && bHadir) return 1;  // b naik ke atas

    if (aHadir && bHadir) {
      // Sama-sama hadir: urutkan waktu absen terbaru di atas
      const timeA = a.waktuKehadiran ? new Date(a.waktuKehadiran).getTime() : 0;
      const timeB = b.waktuKehadiran ? new Date(b.waktuKehadiran).getTime() : 0;
      return timeB - timeA;
    }

    return 0; // Sama-sama belum hadir: tetap urut asal
  });

  // Penentuan Kolom Tabel Dinamis (Solo)
  const apakahSolo = dataTersaringDiurutkan.length > 0
    ? dataTersaringDiurutkan.every(i => i.apakahIndividu)
    : soloDariHelper;

  // Penentuan Kolom Tabel Dinamis (Kelompok Maks 3)
  const apakahKelompokMaks3 = dataTersaringDiurutkan.length > 0
    ? dataTersaringDiurutkan.some(i => i.peserta3 && i.peserta3.trim() !== '' && i.peserta3.trim() !== '-')
    : maks3DariHelper;

  return (
    <>
      {/* Ringkasan Kehadiran Per Lomba */}
      {lombaPilihan === 'semua' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 text-center">
            <h3 className="font-black text-base text-slate-900 uppercase tracking-normal">
              RINGKASAN KEHADIRAN PER LOMBA
            </h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse border border-slate-200 min-w-[700px]">
              {/* Header Tabel */}
              <thead>
                <tr className="bg-[#0B255D] text-[12.5px] font-black text-white uppercase border-b border-white/20">
                  <th className="py-3.5 px-4 text-center border-r border-white/20">Nama Lomba</th>
                  <th className="py-3.5 px-4 text-center border-r border-white/20">Total Terdaftar</th>
                  <th className="py-3.5 px-4 text-center border-r border-white/20">Sudah Hadir</th>
                  <th className="py-3.5 px-4 text-center border-r border-white/20">Belum Hadir</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>

              {/* Isi Tabel */}
              <tbody className="divide-y divide-slate-200 text-slate-950 leading-relaxed">
                {sedangMemuat ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs font-medium">
                      Memuat ringkasan statistik...
                    </td>
                  </tr>
                ) : rekapPerLomba.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs font-medium">
                      Belum ada data cabang lomba.
                    </td>
                  </tr>
                ) : (
                  rekapPerLomba.map((rekap, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors border-b border-slate-200">
                      <td className="py-2.5 px-4 font-bold text-slate-950 border-r border-slate-200 text-[11.8px]">{rekap.namaLomba}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-slate-950 border-r border-slate-200 text-sm">{rekap.total}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-slate-950 border-r border-slate-200 text-sm">
                        {rekap.hadir}
                      </td>
                      <td className="py-2.5 px-4 text-center font-semibold text-slate-950 border-r border-slate-200 text-sm">
                        {rekap.belum}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setLombaPilihan(rekap.namaLomba)}
                          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0066da] border border-blue-200/80 font-bold text-xs rounded-lg transition-all shadow-2xs"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Detail Absensi Peserta */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 text-center">
            <h3 className="font-black text-base md:text-lg text-slate-900 uppercase tracking-normal">
              ABSENSI {lombaPilihan.toUpperCase()}
            </h3>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className={`w-full text-left border-collapse border border-slate-200 ${apakahSolo ? 'w-full min-w-full' : 'min-w-[1450px]'}`}>
              {/* Header Tabel */}
              <thead>
                <tr className="bg-[#0B255D] text-[12px] lg:text-[11px] font-black text-white uppercase tracking-wide border-b border-white/20">
                  <th className={`py-4 px-4 text-center border-r border-white/10 ${apakahSolo ? 'w-[180px]' : 'w-[180px]'}`}>No. Registrasi</th>

                  {!apakahSolo && (
                    <th className="py-4 px-4 w-[280px] text-center border-r border-white/10">Nama Tim</th>
                  )}

                  <th className={`py-4 px-4 text-center border-r border-white/10 ${apakahSolo ? 'w-[300px]' : 'w-[300px]'}`}>
                    {apakahSolo ? 'Nama Peserta' : 'Nama Peserta 1'}
                  </th>

                  {!apakahSolo && (
                    <th className="py-4 px-4 w-[300px] text-center border-r border-white/10">Nama Peserta 2</th>
                  )}

                  {apakahKelompokMaks3 && (
                    <th className="py-4 px-4 w-[300px] text-center border-r border-white/10">Nama Peserta 3</th>
                  )}

                  <th className={`py-4 px-4 text-center border-r border-white/10 ${apakahSolo ? 'w-[260px]' : 'w-[260px]'}`}>Asal Instansi</th>
                  <th className={`py-4 px-4 text-center border-r border-white/10 ${apakahSolo ? 'w-[140px]' : 'w-[140px]'}`}>Status</th>
                  <th className={`py-4 px-4 text-center border-r border-white/10 ${apakahSolo ? 'w-[150px]' : 'w-[150px]'}`}>Waktu</th>
                  <th className={`py-4 px-4 text-center ${apakahSolo ? 'w-[160px]' : 'w-[160px]'}`}>Aksi Manual</th>
                </tr>
              </thead>

              {/* Isi Tabel */}
              <tbody className="divide-y divide-slate-200">
                {sedangMemuat ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      Memuat data detail absensi...
                    </td>
                  </tr>
                ) : dataTersaringDiurutkan.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      Tidak ada data pendaftaran terverifikasi untuk lomba {formatJudul(lombaPilihan)}.
                    </td>
                  </tr>
                ) : (
                  dataTersaringDiurutkan.map((item) => {
                    const adalahHadir = item.statusKehadiran === 'hadir';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-200">
                        {/* No. Registrasi */}
                        <td className="px-4 py-2 border-r border-slate-200 text-[12.7px] lg:text-[11.6px] xl:text-[12.2px] 2xl:text-[13.2px] font-bold text-slate-950 text-center leading-relaxed whitespace-nowrap">
                          {item.idPendaftaran}
                        </td>

                        {/* Nama Tim */}
                        {!apakahSolo && (
                          <td className="px-4 py-2 border-r border-slate-200 text-left text-[12.1px] lg:text-[10.7px] xl:text-[11.6px] 2xl:text-[12.6px] font-bold text-slate-950 leading-relaxed">
                            {item.namaTim ? item.namaTim : '-'}
                          </td>
                        )}

                        {/* Nama Peserta */}
                        <td className="px-4 py-2 border-r border-slate-200 text-[12.7px] lg:text-[11.6px] xl:text-[12.2px] 2xl:text-[13.2px] font-bold text-slate-950 text-left leading-relaxed">
                          {item.peserta1 || '-'}
                        </td>

                        {/* Nama Peserta 2 */}
                        {!apakahSolo && (
                          <td className="px-4 py-2 border-r border-slate-200 text-[12.7px] lg:text-[11.6px] xl:text-[12.2px] 2xl:text-[13.2px] font-bold text-slate-950 text-left leading-relaxed">
                            {item.peserta2 && item.peserta2.trim() !== '-' ? item.peserta2 : '-'}
                          </td>
                        )}

                        {/* Nama Peserta 3 */}
                        {apakahKelompokMaks3 && (
                          <td className="px-4 py-2 border-r border-slate-200 text-[12.7px] lg:text-[11.6px] xl:text-[12.2px] 2xl:text-[13.2px] font-bold text-slate-950 text-left leading-relaxed">
                            {item.peserta3 && item.peserta3.trim() !== '-' ? item.peserta3 : '-'}
                          </td>
                        )}

                        {/* Asal Instansi */}
                        <td className="px-4 py-2 border-r border-slate-200 text-[12.7px] lg:text-[11.6px] xl:text-[12.2px] 2xl:text-[13.2px] font-bold text-slate-950 text-left leading-relaxed">
                          {item.asalInstansi || '-'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-2 text-center whitespace-nowrap border-r border-slate-200 leading-tight">
                          <div className="min-w-[120px] flex justify-center">
                            <span className={`text-[11.7px] lg:text-[10.5px] xl:text-[11.2px] 2xl:text-[12px] font-black uppercase tracking-normal leading-tight ${adalahHadir ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {adalahHadir ? 'Hadir' : 'Belum'}
                            </span>
                          </div>
                        </td>

                        {/* Waktu */}
                        <td className="px-4 py-2 text-center border-r border-slate-200 text-[12.7px] lg:text-[11.6px] xl:text-[12.2px] 2xl:text-[13.2px] font-bold text-slate-950 leading-relaxed whitespace-nowrap">
                          {adalahHadir ? (
                            <span>
                              {formatJamMenit(item.waktuKehadiran)} WIB
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold">-</span>
                          )}
                        </td>

                        {/* Aksi Manual */}
                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => tanganiToggleHadir(item.id, item.statusKehadiran)}
                            className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg font-bold text-[11px] transition-all shadow-sm ${adalahHadir
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                          >
                            {adalahHadir ? 'Batal' : 'Hadir'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default TabelAbsensi;
