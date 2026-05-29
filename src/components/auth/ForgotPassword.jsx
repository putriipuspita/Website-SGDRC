'use client';
// Import Navigasi, Icon dan Notifikasi
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

// Komponen Halaman Lupa Password
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sudahKirim, setSudahKirim] = useState(false);
  const navigasi = useRouter();

  // Fungsi Saat Form Dikirim
  const tanganiKirim = (e) => {
    e.preventDefault();
    if (sudahKirim) return;
    setSudahKirim(true);

    // Kirim Request ke API
    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).catch((err) => {
      console.error('Gagal mengirim email di latar belakang:', err);
    });

    // Notifikasi Sukses
    toast.success('Link reset password telah di kirim, silahkan cek email.', {
      duration: 5000,
      position: 'top-right'
    });

    // Kosongkan input email
    setEmail('');

    // Kembali ke Login
    setTimeout(() => {
      navigasi.push('/login');
    }, 1500);
  };

  return (
    // Bagian Halaman Lupa Password
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-montserrat">
      {/* Container Kotak Lupa Password */}
      <div className="w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-[20px] p-5 pt-6 pb-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">

          {/* Icon Gambar Kunci */}
          <div className="flex justify-center mb-4">
            <div className="w-[56px] h-[56px] bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.02)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E40011" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[32px] h-[32px] text-[#E40011]">
                <path d="M6 10V7a6 6 0 0 1 12 0v3" />
                <rect x="3" y="10" width="18" height="11" rx="3" />
                <line x1="12" y1="13.5" x2="12" y2="17.5" />
              </svg>
            </div>
          </div>

          {/* Container Judul dan Deksripsi */}
          <div className="text-center mb-4">
            {/* Judul */}
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-wide mb-1">
              RESET PASSWORD
            </h1>

            {/* Deskripsi */}
            <p className="text-slate-500 text-[10.5px] font-medium leading-relaxed max-w-[280px] mx-auto">
              Masukan email yang sudah terdaftar dan kami akan kirimkan link untuk mengatur ulang password
            </p>
          </div>

          {/* Formulir Input Email */}
          <form onSubmit={tanganiKirim} className="space-y-4">
            {/* Input Email */}
            <div className="space-y-1.5">
              {/* Label */}
              <label className="block text-slate-700 text-[11px] font-bold pl-1">
                Email
              </label>

              {/* Kotak Input */}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan Email Anda"
                className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#E40011] focus:bg-white text-slate-800 text-[12px] placeholder:text-[11px] rounded-xl py-2.5 px-4 outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/10"
              />
            </div>

            {/* Container Tombol */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Tombol Kembali */}
              <Link
                href="/login"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-2 rounded-xl transition-all duration-200 active:scale-[0.98] text-center uppercase text-[12px] tracking-wide"
              >
                Kembali
              </Link>

              {/* Tombol Kirim */}
              <button
                type="submit"
                disabled={sudahKirim}
                className="w-full bg-[#E40011] hover:bg-[#c4000e] text-white font-black py-2 rounded-xl shadow-md shadow-red-500/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 uppercase text-[12px] tracking-wide"
              >
                Kirim
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
