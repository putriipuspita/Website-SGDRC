'use client';
// Import React, Hook, Navigasi dan Icon
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FormInput } from '../element/FormInput';

// Komponen Halaman Utama Login
const Login = () => {
  // State Input Login
  const [tampilkanSandi, setTampilkanSandi] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pesan, setPesan] = useState({ tipe: '', isi: '' });
  const [apakahLoading, setApakahLoading] = useState(false);
  const navigasi = useRouter();

  // Cek Pesan Sukses dari Verifikasi Email
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verifikasi') === 'sukses') {
      setPesan({ tipe: 'sukses', isi: 'Email berhasil diverifikasi! Silakan login.' });
    }
  }, []);

  // Fungsi Tombol Login
  const tanganiKirim = async (acara) => {
    acara.preventDefault();
    setPesan({ tipe: '', isi: '' });
    setApakahLoading(true);

    // Kirim Request Login
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      // Jika Berhasil
      if (res.ok) {
        localStorage.setItem('token_sgdrc', data.token);
        localStorage.setItem('user_sgdrc', JSON.stringify(data.user));

        // Redirect Berdasarkan Role
        if (data.user.role === 'admin') {
          navigasi.push('/admin/dashboard');
        } else {
          navigasi.push('/peserta/dashboard');
        }
      }
      // Jika Tidak Berhasil
      else {
        setPesan({ tipe: 'error', isi: data.pesan || 'Login gagal' });
      }

      // Jika Error Server
    } catch (err) {
      setPesan({ tipe: 'error', isi: 'Terjadi kesalahan koneksi' });
    } finally {
      setApakahLoading(false);
    }
  };

  return (
    // Halaman Bagian Login
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-montserrat">
      {/* Container Formulir Login */}
      <div className="w-[310px] md:w-[450px] lg:w-[450px] xl:w-[310px] min-w-[310px] md:min-w-[450px] lg:min-w-[450px] xl:min-w-[310px] relative z-10 animate-fade-in py-6">

        {/* Card Utama */}
        <div className="bg-white rounded-[22px] p-5 pt-6 pb-8 md:p-6 md:pt-8 md:pb-10 shadow-[0_20px_50px_rgba(15,23,42,0.05)] border border-slate-100 relative">
          {/* Logo */}
          <div className="flex justify-center mb-5 md:mb-6 lg:mb-5 xl:mb-4">
            <div className="w-24 h-24 md:w-28 md:h-28 lg:w-24 lg:h-24 xl:w-[85px] xl:h-[85px] bg-white rounded-full p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
              <img src="/aset/logo/logo.jpg" alt="Logo SGDRC" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          {/* Judul */}
          <h2 className="text-slate-800 text-lg md:text-2xl lg:text-xl xl:text-lg font-black text-center uppercase tracking-wide mb-1">
            LOGIN
          </h2>

          {/* Pesan Error/Sukses */}
          {pesan.isi && (
            <div className={`p-3 rounded-xl text-[13px] font-bold text-center mb-4 capitalize ${pesan.tipe === 'error' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
              {pesan.isi}
            </div>
          )}

          {/* Deskripsi */}
          <p className="text-slate-500 text-[10.5px] text-center mb-5 lg:mb-4 xl:mb-4 font-medium italic leading-relaxed">
            Masukan email dan password<br />yang telah terdaftar dan terverifikasi
          </p>

          {/* Formulir Login */}
          <form className="space-y-4 md:space-y-6 lg:space-y-4 xl:space-y-3.5" onSubmit={tanganiKirim}>
            <FormInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setPesan({ tipe: '', isi: '' });
              }}
              onFocus={() => setPesan({ tipe: '', isi: '' })}
              icon={Mail}
              required
            />

            {/* Container Input Password */}
            <div className="relative group">
              <FormInput
                type={tampilkanSandi ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPesan({ tipe: '', isi: '' });
                }}
                onFocus={() => setPesan({ tipe: '', isi: '' })}
                icon={Lock}
                required
              />

              {/* Icon Mata */}
              <button
                type="button"
                onClick={() => setTampilkanSandi(!tampilkanSandi)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors z-10"
              >
                {tampilkanSandi ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Lupa Password */}
            <div className="text-right">
              <Link href="/forgot-password" size="sm" className="text-[10px] text-[#16B9FF] hover:text-[#00A3FF] transition-colors font-medium">
                Lupa Password?
              </Link>
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={apakahLoading}
              className="w-full bg-[#E40011] hover:bg-[#c4000e] text-white font-black py-2.5 md:py-3.5 lg:py-2.5 xl:py-2 rounded-xl mt-4 lg:mt-3 xl:mt-2 text-[13px] md:text-[15px] lg:text-[14px] xl:text-[13px] tracking-wider uppercase transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              {apakahLoading ? 'Memproses...' : 'MASUK'}
            </button>
          </form>

          {/* Pindah Ke Register */}
          <p className="text-center text-slate-500 text-[10.4px] mt-6 lg:mt-5 xl:mt-4 font-medium">
            <span className='italic'>Belum punya akun ?</span> <Link href="/register" className="text-red-500 hover:text-red-600 font-bold ml-1 transition-colors">Daftar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
