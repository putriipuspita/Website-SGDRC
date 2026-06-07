'use client';
// Import React, Hook, Navigasi dan Icon
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FormInput } from '../element/FormInput';

// Komponen Halaman Utama Register
const Register = () => {
  // State Formulir Register
  const [tampilkanSandi, setTampilkanSandi] = useState(false);
  const [tampilkanKonfirmasiSandi, setTampilkanKonfirmasiSandi] = useState(false);
  const [dataForm, setDataForm] = useState({
    nama: '',
    email: '',
    password: '',
    konfirmasiPassword: ''
  });

  // State Notifikasi
  const [pesan, setPesan] = useState({ tipe: '', isi: '' });
  const [apakahLoading, setApakahLoading] = useState(false);
  const navigasi = useRouter();

  // Fungsi Kirim Register
  const tanganiKirim = async (acara) => {
    acara.preventDefault();
    setPesan({ tipe: '', isi: '' });

    // Jika Input Password Tidak Sama 
    if (dataForm.password !== dataForm.konfirmasiPassword) {
      setPesan({ tipe: 'error', isi: 'Konfirmasi password tidak cocok' });
      return;
    }

    setApakahLoading(true);

    // Kirim Request Ke Backend
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: dataForm.nama,
          email: dataForm.email,
          password: dataForm.password
        })
      });

      const data = await res.json();

      // Jika Berhasil
      if (res.ok) {
        localStorage.setItem('token_simulasi', data.token);
        navigasi.push('/verifikasi-email');
      }
      // Jika Gagal
      else {
        setPesan({ tipe: 'error', isi: data.pesan || 'Registrasi gagal' });
      }

      // Jika Error Server
    } catch (err) {
      setPesan({ tipe: 'error', isi: 'Terjadi kesalahan koneksi' });
    } finally {
      setApakahLoading(false);
    }
  };

  return (
    // Halaman Bagian Register
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-montserrat">
      {/* Container Formulir Register */}
      <div className="w-full max-w-[350px] px-4 md:px-0 md:w-[450px] lg:w-[310px] xl:w-[310px] md:min-w-[450px] lg:min-w-[310px] xl:min-w-[310px] relative z-10 animate-fade-in py-4">

        {/* Card Utama */}
        <div className="bg-white rounded-[22px] p-5 pt-5 pb-6 md:p-6 md:pt-6 md:pb-8 shadow-[0_20px_50px_rgba(15,23,42,0.05)] border border-slate-100 relative">
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6 lg:mb-5 xl:mb-4">
            <div className="w-20 h-20 md:w-24 md:h-24 lg:w-20 lg:h-20 xl:w-[70px] xl:h-[70px] bg-white rounded-full p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
              <img src="/aset/logo/logo.jpg" alt="Logo SGDRC" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          {/* Judul */}
          <h2 className="text-slate-800 text-lg md:text-2xl lg:text-xl xl:text-lg font-black text-center uppercase tracking-wide mb-1">
            REGISTER
          </h2>

          {/* Pesan Error/Sukses */}
          {pesan.isi && (
            <div className={`p-3 rounded-xl text-[13px] font-bold text-center mb-4 capitalize ${pesan.tipe === 'error' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
              {pesan.isi}
            </div>
          )}

          {/* Deskripsi */}
          <p className="text-slate-500 text-[10.5px] text-center mb-5 lg:mb-4 xl:mb-3 font-medium">
            Daftar untuk mengikuti
            SGD-RC {new Date().getFullYear()}
          </p>

          {/* Form Register */}
          <form className="space-y-3 md:space-y-3 lg:space-y-3 xl:space-y-2" onSubmit={tanganiKirim}>
            {/* Input Nama Lengkap  */}
            <FormInput
              placeholder="Nama Lengkap"
              value={dataForm.nama}
              onChange={(e) => {
                setDataForm({ ...dataForm, nama: e.target.value });
                setPesan({ tipe: '', isi: '' });
              }}
              onFocus={() => setPesan({ tipe: '', isi: '' })}
              icon={User}
              required
            />

            {/* Input Email */}
            <FormInput
              type="email"
              placeholder="Email"
              value={dataForm.email}
              onChange={(e) => {
                setDataForm({ ...dataForm, email: e.target.value });
                setPesan({ tipe: '', isi: '' });
              }}
              onFocus={() => setPesan({ tipe: '', isi: '' })}
              icon={Mail}
              required
            />

            {/* Container Password */}
            <div className="relative group">
              {/* Input Password */}
              <FormInput
                type={tampilkanSandi ? "text" : "password"}
                placeholder="Password"
                value={dataForm.password}
                onChange={(e) => {
                  setDataForm({ ...dataForm, password: e.target.value });
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
                {tampilkanSandi ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>

            {/* Container Konfirmasi Password */}
            <div className="relative group">
              {/* Input Konfirmasi Password */}
              <FormInput
                type={tampilkanKonfirmasiSandi ? "text" : "password"}
                placeholder="Konfirmasi Password"
                value={dataForm.konfirmasiPassword}
                onChange={(e) => {
                  setDataForm({ ...dataForm, konfirmasiPassword: e.target.value });
                  setPesan({ tipe: '', isi: '' });
                }}
                onFocus={() => setPesan({ tipe: '', isi: '' })}
                icon={Lock}
                required
              />

              {/* Icon Mata */}
              <button
                type="button"
                onClick={() => setTampilkanKonfirmasiSandi(!tampilkanKonfirmasiSandi)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors z-10"
              >
                {tampilkanKonfirmasiSandi ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>

            {/* Jarak */}
            <div className="h-1"></div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={apakahLoading}
              className="w-full bg-[#E40011] hover:bg-[#c4000e] text-white font-black py-2.5 md:py-3.5 lg:py-2.5 xl:py-2 rounded-xl mt-4 lg:mt-3 xl:mt-2 text-[13px] md:text-[15px] lg:text-[14px] xl:text-[13px] tracking-wider uppercase transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              {apakahLoading ? 'Mendaftarkan...' : 'DAFTAR'}
            </button>
          </form>

          {/* Pindah Ke Login */}
          <p className="text-center text-slate-500 text-[10.4px] mt-5 lg:mt-4 xl:mt-3 font-medium">
            <span className="italic">Sudah punya akun ?</span>
            <Link href="/login" className="text-red-500 hover:text-red-600 font-bold ml-1 transition-colors">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
