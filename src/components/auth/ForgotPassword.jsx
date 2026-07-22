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
  const tanganiKirim = async (e) => {
    e.preventDefault();
    if (sudahKirim) return;
    setSudahKirim(true);

    try {
      // Kirim Request ke API
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        // Notifikasi Sukses
        toast.success(data.pesan || 'Link reset password telah dikirim! Silakan cek email.', {
          duration: 5000,
          position: 'top-right'
        });

        // Kosongkan input email
        setEmail('');

        // Kembali ke Login
        setTimeout(() => {
          navigasi.push('/login');
        }, 1500);
      } else {
        // Notifikasi Error (Email tidak terdaftar)
        toast.error(data.pesan || 'Email tidak terdaftar!', {
          duration: 4000,
          position: 'top-right'
        });
        setSudahKirim(false);
      }
    } catch (err) {
      console.error('Gagal mengirim email:', err);
      toast.error('Terjadi kesalahan koneksi.', {
        duration: 4000,
        position: 'top-right'
      });
      setSudahKirim(false);
    }
  };

  return (
    // Bagian Halaman Lupa Password
    <div className="h-screen h-[100dvh] w-full bg-slate-50 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden font-montserrat">
      {/* Container Kotak Lupa Password */}
      <div className="w-[310px] min-w-[310px] max-w-[310px] mx-auto relative z-10 animate-fade-in my-auto">
        <div className="bg-white rounded-[22px] p-5 pt-6 pb-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">

          {/* Icon Gambar Kunci */}
          <div className="flex justify-center mb-4">
            <div className="w-[60px] h-[60px] bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.02)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E40011" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[34px] h-[34px] text-[#E40011]">
                <path d="M6 10V7a6 6 0 0 1 12 0v3" />
                <rect x="3" y="10" width="18" height="11" rx="3" />
                <line x1="12" y1="13.5" x2="12" y2="17.5" />
              </svg>
            </div>
          </div>

          {/* Container Judul dan Deksripsi */}
          <div className="text-center mb-4">
            {/* Judul */}
            <h1 className="text-slate-950 text-xl font-black uppercase tracking-wide mb-1">
              RESET PASSWORD
            </h1>

            {/* Deskripsi */}
            <p className="text-slate-700 text-[11.5px] font-medium leading-relaxed max-w-[280px] mx-auto">
              Masukan email yang sudah terdaftar dan kami akan kirimkan link untuk mengatur ulang password
            </p>
          </div>

          {/* Formulir Input Email */}
          <form onSubmit={tanganiKirim} className="space-y-4">
            {/* Input Email */}
            <div className="space-y-1.5">
              {/* Label */}
              <label className="block text-slate-950 text-[11.5px] font-semibold pl-1">
                Email
              </label>

              {/* Kotak Input */}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan Email Anda"
                className="w-full bg-white border border-slate-300 text-slate-950 text-[13px] placeholder:text-[12px] placeholder:text-slate-500 rounded-xl py-2.5 px-4 outline-none focus:border-[#0B255D] focus:ring-2 focus:ring-blue-500/10 transition-all duration-300"
              />
            </div>

            {/* Container Tombol */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Tombol Kembali */}
              <Link
                href="/login"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-center uppercase text-[13px] tracking-wide flex items-center justify-center"
              >
                Kembali
              </Link>

              {/* Tombol Kirim */}
              <button
                type="submit"
                disabled={sudahKirim}
                className="w-full bg-[#E40011] hover:bg-[#c4000e] text-white font-black py-2.5 rounded-xl shadow-md shadow-red-500/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 uppercase text-[13px] tracking-wide"
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
