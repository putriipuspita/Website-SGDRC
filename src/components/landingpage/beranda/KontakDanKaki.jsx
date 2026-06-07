"use client";
import React, { useState, useEffect } from 'react';

// Komponen Untuk Menampilkan Kontak & Footer
export default function KontakDanKaki() {
  // Menyimpan Data Pengaturan Dari Database
  const [pengaturan, setPengaturan] = useState(null);

  // Mengambil data kontak dan pengaturan website dari API
  useEffect(() => {
    fetch('/api/pengaturan')
      .then(res => res.json())
      .then(data => setPengaturan(data))
      .catch(err => console.error("Gagal ambil pengaturan:", err));
  }, []);

  // Daftar Kontak
  const daftarKontak = [
    {
      tipe: 'Email',
      label: 'EMAIL',
      tautan: `mailto:${pengaturan?.email_kontak || 'sgdrc@gmail.com'}`,
      teks: pengaturan?.email_kontak || 'sgdrc@gmail.com',
      ikon: '/aset/icon/gmail.png',
      target: '_self',
      hoverBorder: 'hover:border-brand-blue/80'
    },
    {
      tipe: 'IG Official',
      label: 'IG Official',
      tautan: pengaturan?.ig_official || "https://www.instagram.com/sgdrc_?igsh=NHRjN3A2YjFvbDIw",
      teks: '@sgdrc_',
      ikon: '/aset/icon/instagram.png',
      target: '_blank',
      hoverBorder: 'hover:border-pink-500/80'
    },
    {
      tipe: 'IG Robotika',
      label: 'IG Robotika',
      tautan: "https://www.instagram.com/robotika_uinsgd?igsh=MWkxZHRzeG1rdjdldA==",
      teks: '@robotika_uinbdg',
      ikon: '/aset/icon/instagram.png',
      target: '_blank',
      hoverBorder: 'hover:border-pink-500/80'
    },
    {
      tipe: 'WhatsApp',
      label: 'WHATSAPP',
      tautan: pengaturan?.wa_link_umum || "https://wa.me/6289653263531",
      teks: pengaturan?.wa_link_umum
        ? pengaturan.wa_link_umum.replace('https://wa.me/', '+').replace(/(\d{2})(\d{3})(\d{4})(\d{4})/, '$1 $2-$3-$4')
        : '+62 896-5326-3531',
      ikon: '/aset/icon/whatsapp.png',
      target: '_blank',
      hoverBorder: 'hover:border-green-500/80'
    },
    {
      tipe: 'TikTok',
      label: 'TIKTOK',
      tautan: "https://www.tiktok.com/@sgdrc_?_r=1&_t=ZS-95e32F4S3Ij",
      teks: '@sgdrc_',
      ikon: '/aset/icon/tiktok.jpg',
      target: '_blank',
      hoverBorder: 'hover:border-slate-800',
      imgClass: 'rounded-sm'
    },
    {
      tipe: 'Lokasi',
      label: 'LOKASI',
      tautan: "https://share.google/wdlo8bthb2AMhGYhc",
      teks: 'Aula Abdjan Soelaeman',
      ikon: '/aset/icon/lokasi.png',
      target: '_blank',
      hoverBorder: 'hover:border-brand-red/80'
    }
  ];

  return (
    // Bagian Kontak & Footer
    <footer id="kontak" className="w-full bg-transparent mt-8 md:mt-10 border-t border-brand-blue/30 pt-10 md:pt-12">
      {/* Container Kontak */}
      <div className="w-full px-4 md:px-16 flex flex-col items-center">
        <div className="w-full max-w-[1400px] mx-auto mb-10 md:mb-12">

          {/* Judul */}
          <h2 className="text-[26px] md:text-4xl font-bold tracking-wide text-slate-800 uppercase text-left w-full mb-4">
            KONTAK KAMI
          </h2>

          {/* Deskripsi */}
          <p className="text-slate-500 text-[13.5px] md:text-[14.5px] mb-6 md:mb-8 leading-relaxed">Punya pertanyaan ? Hubungi kami melalui kontak berikut!.</p>

          {/* Container Daftar Kontak */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
            {daftarKontak.map((kontak, indeks) => (
              <a
                key={indeks}
                href={kontak.tautan}
                target={kontak.target}
                rel="noopener noreferrer"
                className={`bg-white border border-slate-200 rounded-xl h-[62px] px-2 flex items-center gap-2.5 shadow-[0_0_10px_rgba(22,185,255,0.05)] transition cursor-pointer ${kontak.hoverBorder}`}
              >
                {/* Icon */}
                <div className="w-10 h-10 flex items-center justify-center p-0.5 flex-shrink-0">
                  <img src={kontak.ikon} alt={kontak.label} className={`w-full h-full object-contain ${kontak.imgClass || ''}`} />
                </div>

                {/* Teks */}
                <div className="overflow-hidden">
                  <p className="text-[10px] text-slate-500 font-bold tracking-wide mb-1.5 uppercase">{kontak.label}</p>
                  <p className="text-[9.5px] text-slate-800 truncate leading-tight">{kontak.teks}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Container Footer */}
      <div className="w-full bg-[#0B255D] py-4 md:py-5 text-center z-10 relative">
        <p className="text-[9px] text-white/50 tracking-wide font-medium">
          © 2026 Sunan Gunung Djati Robotic Competition. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
