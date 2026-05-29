'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegistrationReceipt from './RegistrationReceipt';
import { ArrowLeft, Printer, Download } from 'lucide-react';

// Halaman Menampilkan Bukti Sebelum Cetak
const HalamanInvoice = () => {
  const navigasi = useRouter();

  // Menyimpan Data Yang Akan Di Tampilkan
  const [data, setData] = React.useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('printingInvoice');
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      navigasi.push('/peserta/data');
    }
  }, [navigasi]);

  // Mencegah Halaman Ditampilkan Sebelum Tersedia
  if (!data) return null;

  // Menangani Aksi Print
  const tanganiCetak = () => {
    window.print();
  };

  // Nama File Saat Di Download
  const namaBerkas = `BUKTI_DAFTAR_${data.tim.toUpperCase()}_${data.id}.pdf`;

  return (
    // Bagian Halaman Invoice
    <div className="min-h-screen bg-[#525659] flex flex-col items-center overflow-x-hidden">

      {/* Container PDF-Viewer */}
      <div className="w-full h-14 bg-[#323639] flex items-center justify-between px-6 shadow-md fixed top-0 z-50 print:hidden font-sans">

        {/* Nama File */}
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-1 rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11.363 2c4.155 0 2.637 6 2.637 6s6-1.518 6 2.637v11.363h-20v-20h11.363zm4.137 3l-4.137-4.137v4.137h4.137z" /></svg>
          </div>
          <span className="text-gray-200 text-sm font-medium tracking-wide">{namaBerkas}</span>
        </div>

        {/* Container Tombol */}
        <div className="flex items-center gap-4">
          {/* Tombol Print */}
          <button
            onClick={tanganiCetak}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all title='Print'"
          >
            <Printer size={20} strokeWidth={2} />
          </button>

          {/* Tombol Download */}
          <button
            onClick={tanganiCetak}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all title='Download'"
          >
            <Download size={20} strokeWidth={2} />
          </button>

          {/* Garis Pembatas */}
          <div className="w-[1px] h-6 bg-white/20 mx-2"></div>

          {/* Tombol Kembali */}
          <button
            onClick={() => navigasi.push('/peserta/data')}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Konten Berkas */}
      <div className="bg-white shadow-2xl print:shadow-none mt-24 mb-10 print:mt-0 print:mb-0 animate-in fade-in zoom-in-95 duration-500 origin-top">
        <RegistrationReceipt data={data} />
      </div>

    </div>
  );
};

export default HalamanInvoice;
