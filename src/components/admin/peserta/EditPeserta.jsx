'use client';
import React, { useState, useEffect } from 'react';

// Import Icon
import {
  User, Users, Phone, Trophy, GraduationCap, Building2,
  ChevronDown, Mail, Loader2, ExternalLink, ImageIcon
} from 'lucide-react';

// Import Komponen
import toast from 'react-hot-toast';
import ModalBase from '../../element/ModalBase';
import { FormInput } from '../../element/FormInput';
import { fetchDenganToken } from '../../../lib/apiClient';
import { cekTipeLomba } from '../../../lib/formatHelper';

// Komponen Edit Peserta
const EditPeserta = ({ apakahTerbuka, setApakahTerbuka, dataPeserta, slugLomba, lombaInfo, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nama_tim: '',
    nama_peserta1: '',
    nama_peserta2: '',
    nama_peserta3: '',
    asal_instansi: '',
    whatsapp: '',
    jenjang: '',
    peringkat: '',
    is_sertifikat_siap: 0
  });

  const [buktiTransfer, setBuktiTransfer] = useState(null);

  // UseEffect Untuk Mengisi Form Ketika Modal di Buka
  useEffect(() => {
    if (dataPeserta && apakahTerbuka) {

      // Isi Form Pendaftaran
      setFormData({
        id: dataPeserta.id,
        nama_tim: dataPeserta.namaTim || '',
        nama_peserta1: dataPeserta.peserta1 || '',
        nama_peserta2: dataPeserta.peserta2 || '',
        nama_peserta3: dataPeserta.peserta3 || '',
        asal_instansi: dataPeserta.instansi || '',
        whatsapp: dataPeserta.whatsapp || '',
        jenjang: dataPeserta.jenjang || '',
        peringkat: dataPeserta.peringkat || '',
        is_sertifikat_siap: dataPeserta.is_sertifikat_siap || 0
      });
      setBuktiTransfer(null);
    }
  }, [dataPeserta, apakahTerbuka]);

  // Fungsi Dapatkan Jenjang
  const dapatkanOpsiJenjang = () => {
    const teksJenjang = lombaInfo?.jenjang || '';
    if (!teksJenjang) {
      return ['TK', 'SD / MI', 'SMP / MTS', 'SMA / SMK / MA', 'Perguruan Tinggi'];
    }

    let daftar = [];
    const teksKecil = teksJenjang.toLowerCase();
    const matchUmur = teksKecil.match(/(\d+)\s*tahun/);

    // Jika Ada Batas Umur
    if (matchUmur) {
      const angkaUmur = parseInt(matchUmur[1]);
      if (angkaUmur < 9) {
        daftar = ['TK', 'SD / MI'];
      } else {
        daftar = ['SD / MI'];
      }
    } else {
      const mentah = teksJenjang
        .split(/\s*-\s*|,\s*|\s+dan\s+|\s+&\s+|\s*\/\s*/i)
        .map(item => item.replace(/^\d+\s+/, '').replace(/\s+\d+$/, '').trim())
        .filter(item => item !== '' && !/^\d+$/.test(item));

      daftar = mentah.map(item => {
        const low = item.toLowerCase();
        if (low.includes('mahasiswa') || low.includes('perguruan tinggi')) return 'Perguruan Tinggi';
        if (low.includes('sd') || low === 'mi') return 'SD / MI';
        if (low.includes('smp') || low.includes('mts')) return 'SMP / MTS';
        if (low.includes('sma') || low.includes('smk') || low === 'ma' || low === 'k') return 'SMA / SMK / MA';
        if (low === 'tk') return 'TK';
        return null;
      }).filter(Boolean);
    }

    // Hapus Data Duplikat
    return [...new Set(daftar)];
  };

  // Fungsi Simpan Edit
  const tanganiKirim = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token_sgdrc');
      const dataKirim = new FormData();

      // Masukan Seluruh Data
      dataKirim.append('id', formData.id);
      dataKirim.append('nama_tim', formData.nama_tim);
      dataKirim.append('nama_peserta1', formData.nama_peserta1);
      dataKirim.append('nama_peserta2', formData.nama_peserta2);
      dataKirim.append('nama_peserta3', formData.nama_peserta3);
      dataKirim.append('asal_instansi', formData.asal_instansi);
      dataKirim.append('whatsapp', formData.whatsapp);
      dataKirim.append('jenjang', formData.jenjang);
      dataKirim.append('peringkat', formData.peringkat);
      dataKirim.append('is_sertifikat_siap', formData.is_sertifikat_siap);

      // Kirim Bukti TF Baru (Jika Ada)
      if (buktiTransfer) {
        dataKirim.append('buktiTransfer', buktiTransfer);
      }

      // Request Update ke API
      const res = await fetchDenganToken('/api/admin/peserta', {
        method: 'PUT',
        body: dataKirim
      });

      // Jika Berhasil
      if (res.ok) {
        toast.success("Data Berhasil Diperbarui");
        if (onSuccess) onSuccess();
        setApakahTerbuka(false);
      }
      // Jika Gagal
      else {
        toast.error("Gagal Memperbarui Data");
      }

      // Jika Server Error
    } catch (err) {
      toast.error("Kesalahan Sistem");
    } finally {
      setLoading(false);
    }
  };

  const { apakahSolo, apakahKelompokMaks3 } = cekTipeLomba(slugLomba, lombaInfo);

  return (
    // Komponen Modal
    <ModalBase
      apakahTerbuka={apakahTerbuka}
      setApakahTerbuka={setApakahTerbuka}
      judul="EDIT DATA PESERTA"
      centerTitle={true}
      lebar="max-w-[800px]"
      footer={
        <div className="flex gap-4 w-full">
          <button type="button" onClick={() => setApakahTerbuka(false)} className="flex-1 bg-slate-200 text-slate-950 font-bold py-3 rounded-xl text-[12px] uppercase transition-all active:scale-95">BATAL</button>
          <button type="button" onClick={tanganiKirim} disabled={loading} className="flex-1 bg-[#0B255D] hover:bg-blue-500 text-white font-black py-3 rounded-xl text-[12px] tracking-wide uppercase transition-all shadow-lg shadow-[#0B255D]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "SIMPAN PERUBAHAN"}
          </button>
        </div>
      }
    >

      {/* Container Konten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        {/* Input Email */}
        <FormInput
          label="Email Akun (Tetap)"
          icon={Mail}
          disabled
          type="email"
          value={dataPeserta?.email || ''}
        />

        {/* Input Nama */}
        {!apakahSolo && (
          <FormInput
            label="Nama Tim"
            icon={Trophy}
            value={formData.nama_tim}
            onChange={(e) => setFormData({ ...formData, nama_tim: e.target.value })}
          />
        )}

        {/* Input Nama Peserta 1 */}
        <FormInput
          label={apakahSolo ? 'Nama Lengkap' : 'Peserta 1'}
          icon={User}
          required
          value={formData.nama_peserta1}
          onChange={(e) => setFormData({ ...formData, nama_peserta1: e.target.value })}
        />

        {/* Input Nama Peserta 2 */}
        {!apakahSolo && (
          <FormInput
            label="Peserta 2"
            icon={Users}
            value={formData.nama_peserta2}
            onChange={(e) => setFormData({ ...formData, nama_peserta2: e.target.value })}
          />
        )}

        {/* Input Nama Peserta 3 */}
        {apakahKelompokMaks3 && (
          <FormInput
            label="Peserta 3"
            icon={Users}
            value={formData.nama_peserta3}
            onChange={(e) => setFormData({ ...formData, nama_peserta3: e.target.value })}
          />
        )}

        {/* Input Asal Instansi */}
        <FormInput
          label="Asal Instansi"
          icon={Building2}
          required
          value={formData.asal_instansi}
          onChange={(e) => setFormData({ ...formData, asal_instansi: e.target.value })}
        />

        {/* Input WhatsApp */}
        <FormInput
          label="WhatsApp"
          icon={Phone}
          required
          type="tel"
          value={formData.whatsapp}
          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
        />

        {/* Container Jenjang */}
        <div className="space-y-1">
          {/* Label */}
          <label className="text-slate-950 text-[12.5px] font-semibold ml-1">Jenjang</label>

          {/* Container Input Jenjang */}
          <div className="relative group">
            {/* Icon */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <GraduationCap size={14} className="text-slate-400 group-focus-within:text-[#0B255D]" />
            </div>

            {/* Input Jenjang */}
            <select value={formData.jenjang} onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })} className="w-full bg-white border border-slate-300 text-slate-950 text-[12px] font-medium rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:border-[#0B255D] appearance-none cursor-pointer">
              <option value="">Pilih Jenjang</option>
              {dapatkanOpsiJenjang().map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>

            {/* Icon panah bawah */}
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
        </div>

        {/* Area Bukti Transfer */}
        <div className={`space-y-3 pt-2 ${apakahKelompokMaks3 ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}>
          <div className="flex items-center justify-between px-1">
            {/* Label */}
            <label className="text-slate-950 text-[12.5px] font-semibold flex items-center gap-2">
              Bukti Transfer
            </label>

            {/* Tombol Lihat Bukti */}
            {dataPeserta?.bukti && (
              <a
                href={dataPeserta.bukti}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-black text-[#16B9FF] hover:underline flex items-center gap-1.5 tracking-wider"
              >
                <ExternalLink size={12} /> Lihat Full
              </a>
            )}
          </div>

          {/* Container Pratinjau Saat Ini */}
          <div className={`flex gap-3 ${apakahKelompokMaks3 ? 'flex-row' : 'flex-col'}`}>

            <div className={`${apakahKelompokMaks3 ? 'w-48' : 'w-full'} aspect-video rounded-xl border border-slate-200 overflow-hidden relative group bg-slate-50`}>
              <img src={buktiTransfer ? URL.createObjectURL(buktiTransfer) : (dataPeserta?.bukti || "/aset/legal/bukti.jpg")} alt="Bukti Sekarang" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

              {/* Icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon size={16} className="text-white" />
              </div>

              {/* Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md text-[8px] text-white rounded font-bold uppercase tracking-wider">
                {buktiTransfer ? 'Pilihan Baru' : 'Saat Ini'}
              </div>
            </div>

            {/* Area Unggah Pengganti */}
            <div className="flex-1 relative group border-2 border-dashed border-slate-300 rounded-xl p-3 text-center hover:border-amber-500 transition-all bg-amber-50/10 flex flex-col items-center justify-center gap-1.5">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={(e) => setBuktiTransfer(e.target.files[0])}
              />
              <ImageIcon size={14} className="text-slate-400 group-hover:text-amber-500" />
              <span className="text-[10px] font-bold text-slate-950 truncate px-2 w-full">
                {buktiTransfer ? buktiTransfer.name : 'Ganti Bukti'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

export default EditPeserta;
