'use client';
// Import React, Icon dan Komponen
import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ModalBase from '../../element/ModalBase';
import { FormInput } from '../../element/FormInput';
import { fetchDenganToken } from '../../../lib/apiClient';

// Komponen Utama Tambah Akun
const TambahAkun = ({ setApakahModalTambahTerbuka, onSuccess }) => {
  const [tampilkanSandi, setTampilkanSandi] = useState(false);
  const [tampilkanKonfirmasiSandi, setTampilkanKonfirmasiSandi] = useState(false);
  const [loading, setLoading] = useState(false);

  // State Data Formulir
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    konfirmasiPassword: ''
  });

  // Fungsi Tombol Kirim
  const tanganiKirim = async (e) => {
    if (e) e.preventDefault();

    if (formData.password !== formData.konfirmasiPassword) {
      toast.error("Password Tidak Cocok!");
      return;
    }

    setLoading(true);

    // Ambil Data Dari API menggunakan fetchDenganToken
    try {
      const res = await fetchDenganToken('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama: formData.nama,
          email: formData.email,
          password: formData.password
        })
      });

      // Jika Berhasil
      if (res.ok) {
        toast.success("Akun Baru Berhasil Dibuat!");
        if (onSuccess) onSuccess();
        setApakahModalTambahTerbuka(false);
      }
      // Jika Gagal
      else {
        const data = await res.json();
        toast.error(data.pesan || `Gagal Membuat Akun`);
      }

      // Jika Error Server
    } catch (err) {
      toast.error("Gagal Menghubungi Server");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Komponen Modal Base
    <ModalBase
      apakahTerbuka={true}
      setApakahTerbuka={setApakahModalTambahTerbuka}
      judul="TAMBAH AKUN"
      centerTitle={true}
      lebar="max-w-[450px]"
      footer={
        <div className="flex gap-3 w-full">
          <button type="button" onClick={() => setApakahModalTambahTerbuka(false)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold py-2.5 rounded-xl text-[12px] transition-all uppercase">BATAL</button>
          <button type="button" onClick={tanganiKirim} disabled={loading} className="flex-[1.5] bg-[#0B255D] hover:bg-blue-500 active:bg-[#0B255D] text-white font-black py-2.5 rounded-xl text-[12px] tracking-wide uppercase transition-all shadow-lg shadow-[#0B255D]/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "SIMPAN AKUN"}
          </button>
        </div>
      }
    >

      {/* Container Formulir */}
      <div className="space-y-2.5">

        {/* Data Dummy Supaya Tidak Auto Fill*/}
        <input style={{ display: 'none' }} type="text" name="fake_user_name_prevent_autofill" />
        <input style={{ display: 'none' }} type="email" name="fake_email_prevent_autofill" />
        <input style={{ display: 'none' }} type="password" name="fake_password_prevent_autofill" />

        {/* Input Nama Lengkap */}
        <FormInput
          label="Nama Lengkap"
          icon={User}
          required
          name="full_name_sgdrc_admin"
          autoComplete="none"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          placeholder="Nama Lengkap"
        />

        {/* Input Email */}
        <FormInput
          label="Email"
          icon={Mail}
          required
          readOnly
          onFocus={(e) => e.target.removeAttribute('readonly')}
          name="user_email_sgdrc_admin_final"
          autoComplete="new-password"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
        />

        {/* Container Password */}
        <div className="space-y-1">
          <label className="text-slate-700 text-[12px] font-semibold ml-1">Password</label>
          <div className="relative group">
            <FormInput
              icon={Lock}
              required
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              name="p_s_w_d_sgdrc_final"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              style={{ WebkitTextSecurity: tampilkanSandi ? 'none' : 'disc' }}
            />
            {/* Icon Mata */}
            <button type="button" onClick={() => setTampilkanSandi(!tampilkanSandi)} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors z-10">
              {tampilkanSandi ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        {/* Container Konfirmasi Password */}
        <div className="space-y-1">
          <label className="text-slate-700 text-[12px] font-semibold ml-1">Konfirmasi Password</label>
          <div className="relative group">
            <FormInput
              icon={Lock}
              required
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              name="c_p_s_w_d_sgdrc_final"
              autoComplete="new-password"
              value={formData.konfirmasiPassword}
              onChange={(e) => setFormData({ ...formData, konfirmasiPassword: e.target.value })}
              placeholder="Konfirmasi Password"
              style={{ WebkitTextSecurity: tampilkanKonfirmasiSandi ? 'none' : 'disc' }}
            />
            {/* Icon Mata */}
            <button type="button" onClick={() => setTampilkanKonfirmasiSandi(!tampilkanKonfirmasiSandi)} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors z-10">
              {tampilkanKonfirmasiSandi ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

export default TambahAkun;
