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
    <div className="h-screen h-[100dvh] w-full bg-slate-50 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden font-montserrat">
      {/* Container Formulir Register */}
      <div className="w-[310px] min-w-[310px] max-w-[310px] mx-auto relative z-10 animate-fade-in my-auto">

        {/* Card Utama */}
        <div className="bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] border border-slate-100 relative">
          {/* Logo */}
          <div className="flex justify-center mb-2 sm:mb-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full p-1 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
              <img src="/aset/logo/logo.webp" alt="Logo SGDRC" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          {/* Judul */}
          <h2 className="text-slate-950 text-xl md:text-2xl font-black text-center uppercase tracking-wide mb-1">
            REGISTER
          </h2>

          {/* Pesan Error/Sukses */}
          {pesan.isi && (
            <div className={`p-2 rounded-xl text-[12px] font-bold text-center mb-2.5 capitalize ${pesan.tipe === 'error' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
              {pesan.isi}
            </div>
          )}

          {/* Deskripsi */}
          <p className="text-slate-700 text-[11px] sm:text-[11.5px] text-center mb-3 sm:mb-4 font-medium">
            Daftar untuk mengikuti SGD-RC {new Date().getFullYear()}
          </p>

          {/* Form Register */}
          <form className="space-y-2 sm:space-y-2.5" onSubmit={tanganiKirim}>
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

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={apakahLoading}
              className="w-full bg-[#E40011] hover:bg-[#c4000e] text-white font-black py-2.5 sm:py-3 rounded-xl mt-2 text-[14px] tracking-normal uppercase transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              {apakahLoading ? 'Mendaftarkan...' : 'DAFTAR'}
            </button>
          </form>

          {/* Pindah Ke Login */}
          <p className="text-center text-slate-700 text-[11.5px] mt-3 sm:mt-4 font-medium">
            <span>Sudah punya akun ?</span>
            <Link href="/login" className="text-red-500 hover:text-red-600 font-bold ml-1 transition-colors">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
