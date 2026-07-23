'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, XCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const KontenVerifikasi = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // 'loading' | 'error'
  const [pesanError, setPesanError] = useState('Sedang memverifikasi akun Anda...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setPesanError('Token verifikasi tidak ditemukan.');
      return;
    }

    const verifikasiToken = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        if (res.ok) {
          // Jika sukses, arahkan ke halaman verifikasi-berhasil
          router.replace('/verifikasi-berhasil');
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setPesanError(data.pesan || 'Link verifikasi sudah tidak berlaku atau sudah kadaluwarsa.');
        }
      } catch (err) {
        setStatus('error');
        setPesanError('Terjadi kesalahan koneksi ke server.');
      }
    };

    verifikasiToken();
  }, [token, router]);

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-[30px] p-8 pt-10 pb-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-200 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 rounded-full p-4 animate-pulse">
            <Loader2 size={48} className="text-[#0B255D] animate-spin" />
          </div>
        </div>
        <h1 className="text-slate-800 text-lg font-black uppercase tracking-wider mb-2">Memproses Verifikasi</h1>
        <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
          Mohon tunggu sebentar, kami sedang memverifikasi akun Anda ke sistem...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[30px] p-8 pt-10 pb-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-200 text-center animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="bg-rose-50 rounded-full p-4 shadow-[0_10px_25px_rgba(244,63,94,0.1)] border border-rose-100">
          <XCircle size={48} className="text-rose-500 animate-bounce" />
        </div>
      </div>
      <h1 className="text-slate-800 text-lg font-black uppercase tracking-wider mb-2">Verifikasi Gagal</h1>
      <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-8 px-4">
        {pesanError}
      </p>
      <Link
        href="/register"
        className="inline-block w-full bg-[#0B255D] hover:bg-blue-600 text-white font-black py-3 rounded-xl tracking-wider uppercase transition-all duration-300 active:scale-[0.98] text-[12px]"
      >
        KEMBALI KE REGISTRASI
      </Link>
    </div>
  );
};

export default function HalamanVerifikasi() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-montserrat">
      <div className="w-[320px] md:w-[400px] relative z-10 my-auto">
        <Suspense fallback={
          <div className="bg-white rounded-[30px] p-8 pt-10 pb-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-200 text-center">
            <Loader2 size={48} className="text-[#0B255D] animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-[13px]">Memuat halaman...</p>
          </div>
        }>
          <KontenVerifikasi />
        </Suspense>
      </div>
    </div>
  );
}
