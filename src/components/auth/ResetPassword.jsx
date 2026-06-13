'use client';
// Import Router, Icon dan Notifikasi
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

// Komponen Utama Ubah Password
const ResetPasswordForm = () => {
  // Bagian Router
  const searchParams = useSearchParams();
  const navigasi = useRouter();
  const token = searchParams.get('token');

  // State untuk Formulir Ubah Password
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [tampilkanSandi, setTampilkanSandi] = useState(false);
  const [apakahLoading, setApakahLoading] = useState(false);

  // Validasi Token Saat Halaman di Buka
  useEffect(() => {
    if (!token) {
      toast.error('Token tidak ditemukan atau tidak valid.');
    }
  }, [token]);

  // Fungsi Submit Ubah Password
  const tanganiKirim = async (e) => {
    e.preventDefault();
    if (passwordBaru !== konfirmasiPassword) {
      return toast.error('Konfirmasi password tidak cocok!');
    }
    if (passwordBaru.length < 6) {
      return toast.error('Password minimal 6 karakter!');
    }

    // Bagian Loading
    setApakahLoading(true);

    // Kirim Request Ke Backend
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, passwordBaru })
      });
      const data = await res.json();

      // Jika Reset Berhasil
      if (res.ok) {
        toast.success(data.pesan, { duration: 4000, position: 'top-right' });
        setTimeout(() => {
          navigasi.push('/login');
        }, 2500);
      }
      // Jika Gagal
      else {
        toast.error(data.pesan || 'Gagal reset password', { position: 'top-right' });
      }

      // Jika Error di Server
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi', { position: 'top-right' });
    } finally {
      setApakahLoading(false);
    }
  };

  return (
    // Bagian Halaman Reset Password
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Judul */}
      <div className="text-center mb-6">
        <h1 className="text-[24px] font-black text-slate-800 uppercase tracking-tight mb-2">Buat Password Baru</h1>
      </div>

      {/* Validasi Token */}
      {!token ? (
        <div className="text-center py-4 text-rose-500 font-bold text-xs">
          Sesi tidak valid. Silakan minta link reset baru.
        </div>
      ) : (

        // Formulir Reset Password
        <form onSubmit={tanganiKirim} className="space-y-5">
          {/* Container Input Password */}
          <div className="space-y-2">
            {/* Label */}
            <label className="block text-slate-700 text-[13px] font-bold pl-1">
              Password Baru
            </label>

            {/* Container Input dan Lihat Password */}
            <div className="relative group">
              {/* Input Password */}
              <input
                type={tampilkanSandi ? "text" : "password"}
                required
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                placeholder="Masukkan Password Baru"
                className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#E40011] focus:bg-white text-slate-800 text-sm rounded-2xl py-3.5 pl-5 pr-12 outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/10 placeholder:text-slate-400"
                suppressHydrationWarning
              />

              {/* Icon Mata */}
              <button
                type="button"
                onClick={() => setTampilkanSandi(!tampilkanSandi)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                suppressHydrationWarning
              >
                {tampilkanSandi ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Container Konfirmasi Password */}
          <div className="space-y-2">
            {/* Label */}
            <label className="block text-slate-700 text-[13px] font-bold pl-1">
              Konfirmasi Password Baru
            </label>

            {/* Container Input Konfirmasi dan Lihar Password */}
            <div className="relative group">
              {/* Input Konfirmasi Password */}
              <input
                type={tampilkanSandi ? "text" : "password"}
                required
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                placeholder="Ulangi Password Baru"
                className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#E40011] focus:bg-white text-slate-800 text-sm rounded-2xl py-3.5 pl-5 pr-12 outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/10 placeholder:text-slate-400"
                suppressHydrationWarning
              />

              {/* Icon Mata */}
              <button
                type="button"
                onClick={() => setTampilkanSandi(!tampilkanSandi)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                suppressHydrationWarning
              >
                {tampilkanSandi ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Tombol Simpan Password */}
          <button
            disabled={apakahLoading}
            className="w-full bg-[#E40011] hover:bg-[#c4000e] text-white font-black py-3.5 rounded-xl shadow-md shadow-red-500/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 uppercase text-[13px] tracking-wider"
            suppressHydrationWarning
          >
            {apakahLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              'Simpan Password'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

// Halaman Utama Reset Password
const ResetPassword = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-montserrat">
      <div className="w-full max-w-[380px]">
        <div className="bg-white rounded-[20px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
          <Suspense fallback={<div className="text-center py-10">Memuat...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
