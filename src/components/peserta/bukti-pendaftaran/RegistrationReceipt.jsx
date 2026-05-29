import React from 'react';

// Komponen Untuk Menampilkan Bukti Pendaftaran dan Invoice Peserta
const KwitansiPendaftaran = ({ data, pengaturan = {} }) => {
  if (!data) return null;

  // Mengubah Angka Menjadi Format Rupiah
  const formatRupiah = (angka) => {
    if (!angka) return "Rp. 0";
    if (typeof angka === 'string' && angka.includes('Rp')) return angka;
    const stringAngka = String(angka).replace(/[^0-9]/g, '');
    return "Rp. " + stringAngka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Mengambil Nominal dari Database
  const nominal = formatRupiah(data.biaya || 0);

  // Mengambil Data Pengaturan Dari Halaman Admin
  const namaKetua = (pengaturan && pengaturan.ketua_pelaksana) || "Sarah Nurul Yakin";
  const logoPath = (pengaturan && pengaturan.path_logo_robotika) || "/aset/logo/robotika.png";
  const logoSgdrcPath = (pengaturan && pengaturan.path_logo_sgdrc) || "/aset/logo/logo.jpg";
  const ttdPath = (pengaturan && pengaturan.path_ttd) || "/aset/legal/ttd putra.png";
  const capPath = (pengaturan && pengaturan.path_cap) || "/aset/legal/cap sgdrc.png";
  const tahunSekarang = new Date().getFullYear();
  const nomorWa = (pengaturan && pengaturan.wa_link_umum) ? pengaturan.wa_link_umum.replace(/https:\/\/wa\.me\//, '').replace(/\//g, '') : "089653263531";
  const nomorSurat = `REG-SGDRC-${tahunSekarang}-${String(data.id).padStart(4, '0')}`;

  return (
    <>
      {/* Pengaturan Ukuran Dokument Saat Cetak */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              -webkit-print-color-adjust: exact;
            }
            #registration-receipt {
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
          }
        `}
      </style>

      {/* Halaman Bukti Pendaftaran dan Invoice*/}
      <div id="registration-receipt"
        className="bg-white text-black p-0 w-[210mm] h-[297mm] mx-auto relative overflow-hidden"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}>

        {/* Container Kop Surat*/}
        <div className="flex items-center justify-between px-2 pt-10 pb-4 border-b-[4px] border-black border-double mx-10">

          {/* Logo Kiri */}
          <div className="w-[140px] flex-shrink-0">
            <img src={logoPath} alt="BSO Robotika" className="w-full h-auto" />
          </div>

          {/* Teks */}
          <div className="flex-1 text-center font-bold px-2">
            <h1 className="text-[13pt] leading-tight uppercase">PANITIA SUNAN GUNUNG DJATI ROBOTIC COMPETITION (SGDRC) {tahunSekarang}</h1>
            <h2 className="text-[13pt] leading-tight uppercase">BADAN SEMI OTONOM ROBOTIKA</h2>
            <h3 className="text-[13pt] leading-tight uppercase font-bold">DEWAN EKSEKUTIF MAHASISWA</h3>
            <h3 className="text-[13pt] leading-tight uppercase font-bold">FAKULTAS SAINS DAN TEKNOLOGI</h3>
            <h3 className="text-[13pt] leading-tight uppercase font-bold tracking-tight">UNIVERSITAS ISLAM NEGERI</h3>
            <h3 className="text-[13pt] leading-tight uppercase tracking-tight">SUNAN GUNUNG DJATI BANDUNG</h3>

            <div className="text-[8.5pt] font-normal italic leading-normal mt-2 border-t border-black/40 pt-1">
              <p className="not-italic whitespace-nowrap">Jl. A. H. Nasution No. 105 Gedung Student Center Lantai 3, Cibiru, Bandung, 40614</p>
              <p className="not-italic">Email: robotika@uinsgd.ac.id | Telp: {nomorWa}</p>
            </div>
          </div>

          {/* Logo Kanan */}
          <div className="w-[140px] flex-shrink-0 flex justify-center items-center">
            <img src={logoSgdrcPath} alt="Logo SGDRC" className="w-full h-auto object-contain" />
          </div>
        </div>

        {/* Garis Pembatas Horizontal */}
        <div className="px-14 pt-1 pb-4 text-[12pt]" style={{ lineHeight: '1.4' }}>

          {/* Judul Dokumen */}
          <div className="text-center mb-4">
            <h1 className="text-[15pt] font-bold uppercase underline decoration-2 underline-offset-4">Bukti Pendaftaran & Invoice</h1>
          </div>

          {/* Container Data Pendaftaran */}
          <div className="mb-4">
            <h4 className="font-bold mb-2 uppercase text-[10pt]">I. Informasi Pendaftaran</h4>
            {/* Tabel Informasi Pendaftaran */}
            <table className="w-full border-collapse border border-gray-400 text-[10pt]">
              <tbody>
                {/* Nomor Registrasi */}
                <tr>
                  <td className="border border-gray-400 px-3 pt-1 pb-5 font-bold bg-gray-50 w-52 font-serif" style={{ verticalAlign: 'middle' }}>Nomor Registrasi</td>
                  <td className="border border-gray-400 px-3 pt-1 pb-5 font-bold" style={{ verticalAlign: 'middle' }}>{nomorSurat}</td>
                </tr>

                {/* Kategori Lomba */}
                <tr>
                  <td className="border border-gray-400 px-3 pt-1 pb-5 font-bold bg-gray-50 font-serif" style={{ verticalAlign: 'middle' }}>Kategori Lomba</td>
                  <td className="border border-gray-400 px-3 pt-1 pb-5 font-bold text-blue-800" style={{ verticalAlign: 'middle' }}>{data.lomba}</td>
                </tr>

                {/* Nama Tim */}
                {data.tim && data.tim !== '-' && (
                  <tr>
                    <td className="border border-gray-400 px-3 pt-1 pb-5 font-bold bg-gray-50 font-serif" style={{ verticalAlign: 'middle' }}>Nama Tim</td>
                    <td className="border border-gray-400 px-3 pt-1 pb-5 font-bold capitalize" style={{ verticalAlign: 'middle' }}>{data.tim}</td>
                  </tr>
                )}

                {/* Nama Peserta */}
                <tr>
                  <td className="border border-gray-400 px-3 pt-2 pb-6 font-bold bg-gray-50 font-serif" style={{ verticalAlign: 'middle' }}>Nama Peserta</td>
                  <td className="border border-gray-400 px-3 pt-2 pb-6 font-bold capitalize" style={{ verticalAlign: 'middle' }}>
                    <div className="space-y-1">
                      {data.peserta.filter(n => n && n.trim() !== "").map((nama, i, arr) => (
                        <div key={i} className="flex gap-2 leading-tight">
                          {arr.length > 1 && <span className="w-5 shrink-0 font-bold">{i + 1}.</span>}
                          <span className="font-bold">{nama}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* Jenjang */}
                <tr>
                  <td className="border border-gray-400 px-3 pt-1 pb-5 font-bold bg-gray-50 font-serif" style={{ verticalAlign: 'middle' }}>Jenjang</td>
                  <td className="border border-gray-400 px-3 pt-1 pb-5" style={{ verticalAlign: 'middle' }}>{data.jenjang}</td>
                </tr>

                {/* Asal Instansi */}
                <tr>
                  <td className="border border-gray-400 px-3 pt-1 pb-5 font-bold bg-gray-50 font-serif" style={{ verticalAlign: 'middle' }}>Asal Instansi</td>
                  <td className="border border-gray-400 px-3 pt-1 pb-5" style={{ verticalAlign: 'middle' }}>{data.instansi}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Container Rincian Biaya */}
          <div className="mb-4">
            <h4 className="font-bold mb-2 uppercase text-[10pt]">II. Rincian Pembayaran</h4>
            {/* Tabel Rincian Biaya */}
            <table className="w-full border border-black border-collapse text-[10pt]">

              {/* Header Tabel */}
              <thead>
                <tr className="bg-gray-100 uppercase text-[9pt]">
                  <th className="border border-black px-3 pt-1 pb-5 text-left" style={{ verticalAlign: 'middle' }}>Deskripsi Layanan</th>
                  <th className="border border-black px-3 pt-1 pb-5 text-right w-40 font-bold" style={{ verticalAlign: 'middle' }}>Nominal (IDR)</th>
                </tr>
              </thead>

              {/* Isi Tabel */}
              <tbody>
                {/* Biaya Registrasi */}
                <tr>
                  <td className="border border-black px-3 pt-1.5 pb-5 italic font-medium" style={{ verticalAlign: 'middle' }}>Biaya Registrasi {data.lomba} - SGDRC {tahunSekarang}</td>
                  <td className="border border-black px-3 pt-1.5 pb-5 text-right font-bold" style={{ verticalAlign: 'middle' }}>{nominal}</td>
                </tr>

                {/* Total Dibayarkan */}
                <tr className="font-bold bg-gray-50">
                  <td className="border border-black px-3 pt-1 pb-5 text-right uppercase italic text-emerald-800" style={{ verticalAlign: 'middle' }}>Total Dibayarkan (LUNAS)</td>
                  <td className="border border-black px-3 pt-1 pb-5 text-right text-emerald-800 text-[12pt]" style={{ verticalAlign: 'middle' }}>{nominal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Container Catatn */}
          <div className="mb-4 text-[10pt]">
            {/* Judul */}
            <p className="font-bold underline mb-1 uppercase tracking-wider text-[10pt]">CATATAN:</p>

            {/* Container Isi Catatan */}
            <div className="space-y-0.5 font-medium leading-relaxed">
              {[
                "Harap simpan bukti pendaftaran ini sebagai syarat daftar ulang di lokasi lomba.",
                "Pastikan Anda telah bergabung ke Grup WhatsApp peserta melalui dashboard.",
                "Dokumen ini sah dan diterbitkan secara elektronik oleh Panitia SGDRC."
              ].map((catatan, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-4 shrink-0">{i + 1}.</span>
                  <p>{catatan}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Container Tanda Tangan */}
          <div className="flex justify-end pr-0">
            <div className="text-center relative w-72">

              {/* Kota, Tanggal, Jabatan */}
              <p className="mb-1 text-[11pt]">Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="mb-0 font-bold uppercase leading-tight text-[11pt]">Ketua Pelaksana</p>
              <p className="mb-16 font-bold uppercase leading-tight text-[11pt]">SGDRC</p>

              {/* Container TTD */}
              <div className="absolute top-[3.5rem] left-0 w-full h-24 pointer-events-none">
                {/* Stempel*/}
                <div className="absolute -top-4 left-1 w-36 h-auto z-20">
                  <img src={capPath} alt="Cap SGDRC" className="w-full opacity-85 rotate-[-5deg]" />
                </div>

                {/* TTD */}
                <div className="absolute top-1 left-1/4 w-36 h-auto z-10 translate-x-2">
                  <img src={ttdPath} alt="TTD" className="w-full h-auto object-contain mix-blend-multiply opacity-90 scale-125" />
                </div>
              </div>

              {/* Nama Ketuplak */}
              <p className="mt-2 font-bold uppercase text-[11pt]">{namaKetua}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KwitansiPendaftaran;
