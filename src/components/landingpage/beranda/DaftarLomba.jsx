'use client';
import { useState, useEffect } from 'react';

// // Komponen untuk menampilkan seluruh daftar perlombaan
export default function DaftarLomba({ dataAwal = [] }) {
  // Menyimpan data lomba yang akan ditampilkan
  const [dataLomba, setDataLomba] = useState(dataAwal);

  // Jika data belum tersedia dari server component (Ambil Dari API)
  useEffect(() => {
    if (dataLomba.length === 0) {
      fetch('/api/lomba')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDataLomba(data);
          } else {
            console.error("Data lomba bukan array:", data);
          }
        })
        .catch(err => console.error("Gagal ambil lomba:", err));
    }
  }, [dataAwal]);

  // Data Yang Akan Di Tampilkan
  const dataLombaRender = dataLomba;

  // Hitung jumlah lomba untuk menentukan layout grid
  const totalLomba = Array.isArray(dataLombaRender) ? dataLombaRender.length : 0;

  // Menentukan Grid Kolom
  let gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  if (totalLomba === 1) {
    gridColsClass = "grid-cols-1 max-w-[310px] mx-auto";
  } else if (totalLomba === 2) {
    gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 max-w-[630px] mx-auto";
  } else if (totalLomba === 3) {
    gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-[950px] mx-auto";
  } else if (totalLomba === 4) {
    gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-[1270px] mx-auto";
  } else if (totalLomba === 5) {
    gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
  }

  return (
    // Bagian Daftar Perlombaan
    <section id="lomba" className="w-full bg-transparent py-6 md:py-10 px-4 md:px-16 relative flex flex-col items-center">

      {/* Membatasi lebar konten agar tidak terlalu melebar */}
      <div className="w-full max-w-[1400px] mx-auto">

        {/* Judul */}
        <h2 className="text-center text-[26px] md:text-4xl font-bold tracking-wide text-slate-800 mb-6 md:mb-10 w-full z-10 relative">
          JENIS PERLOMBAAN
        </h2>

        {/* Container Daftar Lomba */}
        <div className={`grid gap-3 md:gap-4 gap-y-6 md:gap-y-9 px-0 w-full ${gridColsClass}`}>
          {Array.isArray(dataLombaRender) && dataLombaRender.map((lomba, indeks) => {
            // Tentukan Warna Kotak
            const warnaTema = indeks % 2 === 0 ? '#0B255D' : '#E40011';

            return (
              // Kartu Daftar Lomba
              <div
                key={indeks}
                className="w-full bg-white rounded-3xl p-1 relative overflow-hidden shadow-md group border"
                style={{ borderColor: warnaTema }}
              >
                {/* Aksen Sudut Kiri Atas*/}
                <div
                  className="absolute top-0 left-0 w-[35%] h-[30%] pointer-events-none z-10"
                  style={{
                    borderTop: `6px solid ${warnaTema}`,
                    borderLeft: `6px solid ${warnaTema}`,
                    borderTopLeftRadius: '1.5rem'
                  }}
                ></div>

                {/* Aksen Sudut Kanan Bawah*/}
                <div
                  className="absolute bottom-0 right-0 w-[35%] h-[30%] pointer-events-none z-10"
                  style={{
                    borderBottom: `6px solid ${warnaTema}`,
                    borderRight: `6px solid ${warnaTema}`,
                    borderBottomRightRadius: '1.5rem'
                  }}
                ></div>

                {/* Container Isi Kartu  */}
                <div
                  className="w-full h-full rounded-[1.2rem] border-2 flex flex-col bg-white overflow-hidden relative z-0"
                  style={{ borderColor: warnaTema }}
                >

                  {/* Tempat Gambar Lomba */}
                  <div className={`w-full relative flex items-center justify-center bg-slate-50 ${totalLomba === 5 ? 'h-[140px] md:h-32' : 'h-[140px] md:h-40'}`}>
                    <img src={lomba.gambar || '/aset/logo/placeholder.png'} alt={lomba.judul} className="h-full w-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundColor: warnaTema }}></div>
                  </div>

                  {/* Container Informasi Lomba */}
                  <div className="p-3 md:p-4 flex flex-col flex-grow relative z-20">

                    {/* Judul Lomba */}
                    <h3
                      className="text-[11px] md:text-[12px] lg:text-[12.5px] font-black tracking-tighter mb-3 text-center leading-tight uppercase whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ color: warnaTema }}
                    >
                      {lomba.judul}
                    </h3>

                    {/* Deskripsi Lomba */}
                    <p className="text-[10.5px] sm:text-[11.5px] md:text-[12.4px] text-slate-500 flex-grow mb-5 leading-relaxed text-center">
                      {lomba.deskripsi}
                    </p>

                    {/* Container Label */}
                    <div className="flex flex-row gap-2 mt-auto">
                      {(typeof lomba.label === 'string' ? JSON.parse(lomba.label || '[]') : (lomba.label || [])).map((labelLomba, indeksLabel, arrayLabel) => {

                        // Atur Warna Label
                        let warnaBg = '#E40011';
                        if (arrayLabel.length > 1) {
                          // Jika 2 tombol 1 Merah, 2 Biru
                          warnaBg = indeksLabel === 0 ? '#E40011' : '#0B255D';
                        } else {
                          // Jika 1 tombol Selang-seling berdasarkan kartu
                          warnaBg = indeks % 2 === 0 ? '#E40011' : '#0B255D';
                        }

                        return (
                          // Kotak Label
                          <div
                            key={indeksLabel}
                            className="flex-1 px-1 py-1 rounded-lg shadow-sm flex flex-col items-center justify-center text-center min-h-[32px] text-white"
                            style={{ backgroundColor: warnaBg }}
                          >

                            {/* Teks Label */}
                            <span className={`${arrayLabel.length === 1 ? 'text-[10.5px] md:text-[12.5px]' : 'text-[9px] md:text-[9.5px]'} font-bold uppercase leading-none tracking-tighter`}>
                              {labelLomba.teks}
                            </span>

                            {/* Sub Teks Label */}
                            {labelLomba.sub && (
                              <span className="text-[7.5px] md:text-[8px] opacity-90 font-medium leading-none mt-1">
                                {labelLomba.sub}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
