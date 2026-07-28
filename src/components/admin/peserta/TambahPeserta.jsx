'use client';
import React, { useState, useEffect } from 'react';

// Import Icon
import {
  User, Users, Phone, Trophy, GraduationCap, Building2,
  ChevronDown, Check, Loader2, Upload, Search
} from 'lucide-react';

// Import Komponen
import toast from 'react-hot-toast';
import ModalBase from '../../element/ModalBase';
import { FormInput } from '../../element/FormInput';
import { fetchDenganToken } from '../../../lib/apiClient';
import { cekTipeLomba } from '../../../lib/formatHelper';

// Komponen Utama Tambah Peserta
const TambahPeserta = ({ apakahTerbuka, setApakahTerbuka, slugLomba, lombaInfo, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [daftarEmail, setDaftarEmail] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [apakahSaranTerbuka, setApakahSaranTerbuka] = useState(false);
  const [buktiTransfer, setBuktiTransfer] = useState(null);
  const [previewBukti, setPreviewBukti] = useState(null);

  // Reset File Bukti TF & Preview Gambar
  useEffect(() => {
    if (apakahTerbuka) {
      setBuktiTransfer(null);
      setPreviewBukti(null);
    }
  }, [apakahTerbuka]);

  // State Form Input
  const [formData, setFormData] = useState({
    nama_tim: '',
    nama_peserta1: '',
    nama_peserta2: '',
    nama_peserta3: '',
    asal_instansi: '',
    whatsapp: '',
    jenjang: ''
  });

  // Ambil Daftar Email User dari Database
  useEffect(() => {
    const ambilEmail = async () => {
      try {
        const res = await fetchDenganToken('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setDaftarEmail(data.map(u => u.email));
        }
      } catch (err) { console.error(err); }
    };
    if (apakahTerbuka) ambilEmail();
  }, [apakahTerbuka]);

  // Fungsi Filter Email Terdaftar
  const saranEmail = daftarEmail.filter(e =>
    e.toLowerCase().includes(searchEmail.toLowerCase()) && searchEmail !== ''
  );

  // Fungsi Kirim Form
  const tanganiKirim = async (e) => {
    if (e) e.preventDefault();
    if (!searchEmail) return toast.error("Email Pendaftar Wajib Diisi");

    setLoading(true);

    // Append Data Formulir
    try {
      const dataKirim = new FormData();
      dataKirim.append('email', searchEmail);
      dataKirim.append('slug', slugLomba);
      dataKirim.append('nama_tim', formData.nama_tim);
      dataKirim.append('nama_peserta1', formData.nama_peserta1);
      dataKirim.append('nama_peserta2', formData.nama_peserta2);
      dataKirim.append('nama_peserta3', formData.nama_peserta3);
      dataKirim.append('asal_instansi', formData.asal_instansi);
      dataKirim.append('whatsapp', formData.whatsapp);
      dataKirim.append('jenjang', formData.jenjang);
      if (buktiTransfer) dataKirim.append('buktiTransfer', buktiTransfer);

      // Request API Tambah Peserta
      const res = await fetchDenganToken('/api/admin/peserta', {
        method: 'POST',
        body: dataKirim
      });

      // Jika Berhasil
      if (res.ok) {
        toast.success("Peserta Berhasil Ditambahkan!");
        if (onSuccess) onSuccess();
        setApakahTerbuka(false);

        // Reset Form
        setFormData({ nama_tim: '', nama_peserta1: '', nama_peserta2: '', nama_peserta3: '', asal_instansi: '', whatsapp: '', jenjang: '' });
        setSearchEmail('');
        setPreviewBukti(null);
      }
      // Jika Gagal
      else {
        const data = await res.json();
        toast.error(data.pesan || "Gagal Menambah Peserta");
      }

      // Jika Server Error
    } catch (err) {
      toast.error("Terjadi Kesalahan Sistem");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Tangani Upload File Bukti Transfer
  const tanganiFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiTransfer(file);
      setPreviewBukti(URL.createObjectURL(file));
    }
  };

  // Fungsi Dapatkan Opsi Jenjang
  const dapatkanOpsiJenjang = () => {
    const teksJenjang = lombaInfo?.jenjang || '';
    if (!teksJenjang) {
      return ['TK', 'SD / MI', 'SMP / MTS', 'SMA / SMK / MA', 'Perguruan Tinggi'];
    }

    let daftar = [];
    const teksKecil = teksJenjang.toLowerCase();
    const matchUmur = teksKecil.match(/(\d+)\s*tahun/);

    // Jika Menggunakan Umur
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

    return [...new Set(daftar)];
  };

  const { apakahSolo, apakahKelompokMaks3 } = cekTipeLomba(slugLomba, lombaInfo);

  return (
    // Modal Utama
    <ModalBase
      apakahTerbuka={apakahTerbuka}
      setApakahTerbuka={setApakahTerbuka}
      judul="TAMBAH PESERTA"
      centerTitle={true}
      lebar="max-w-[800px]"
      footer={
        <div className="flex gap-3 w-full">
          <button type="button" onClick={() => setApakahTerbuka(false)} className="flex-1 bg-slate-200 text-slate-950 font-bold py-2.5 rounded-xl text-[12px] uppercase transition-all active:scale-95">BATAL</button>
          <button type="button" onClick={tanganiKirim} disabled={loading} className="flex-1 bg-[#0B255D] hover:bg-blue-500 text-white font-black py-2.5 rounded-xl text-[12px] tracking-wide uppercase transition-all shadow-lg shadow-[#0B255D]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "SIMPAN DATA"}
          </button>
        </div>
      }
    >

      {/* Container Halaman Tambah Peserta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
        {/* Dummy Supaya Tidak Auto Complete */}
        <input style={{ display: 'none' }} type="text" name="fake_user_name_prevent_autofill_p" />
        <input style={{ display: 'none' }} type="email" name="fake_email_prevent_autofill_p" />

        {/* Container Input Email */}
        <div className="space-y-1">
          {/* Labels */}
          <label className="text-slate-950 text-[12.5px] font-semibold ml-1 italic">Email Akun Peserta</label>

          {/* Container Input Email */}
          <div className="relative group">
            {/* Icon */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={14} className="text-slate-400 group-focus-within:text-[#0B255D]" />
            </div>

            {/* Input Email */}
            <input
              type="text"
              required
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              name="participant_email_search_sgdrc_final"
              autoComplete="new-password"
              value={searchEmail}
              onChange={(e) => { setSearchEmail(e.target.value); setApakahSaranTerbuka(true); }}
              placeholder="Masukkan atau cari email akun"
              className="w-full bg-white border border-slate-300 text-slate-950 text-[12px] rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#0B255D]"
            />

            {/* Fungsi Saran Email Terdaftar */}
            {apakahSaranTerbuka && saranEmail.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1">
                {saranEmail.map((email) => (
                  <button key={email} type="button" onClick={() => { setSearchEmail(email); setApakahSaranTerbuka(false); }} className="w-full px-4 py-2 text-left hover:bg-slate-50 text-[12px] font-semibold text-slate-950 flex items-center justify-between">
                    {email} <Check size={13} className="text-[#16B9FF]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nama Tim */}
        {!apakahSolo && (
          <FormInput
            label="Nama Tim"
            icon={Trophy}
            value={formData.nama_tim}
            onChange={(e) => setFormData({ ...formData, nama_tim: e.target.value })}
            placeholder="Masukkan nama tim"
          />
        )}

        {/* Nama Peserta 1 */}
        <FormInput
          label={apakahSolo ? 'Nama Lengkap' : 'Peserta 1'}
          icon={User}
          required
          value={formData.nama_peserta1}
          onChange={(e) => setFormData({ ...formData, nama_peserta1: e.target.value })}
          placeholder="Nama Peserta 1"
        />

        {/* Nama Peserta 2 */}
        {!apakahSolo && (
          <FormInput
            label="Peserta 2"
            icon={Users}
            value={formData.nama_peserta2}
            onChange={(e) => setFormData({ ...formData, nama_peserta2: e.target.value })}
            placeholder="Nama Peserta 2"
          />
        )}

        {/* Nama Peserta 3 */}
        {apakahKelompokMaks3 && (
          <FormInput
            label="Peserta 3"
            icon={Users}
            value={formData.nama_peserta3}
            onChange={(e) => setFormData({ ...formData, nama_peserta3: e.target.value })}
            placeholder="Nama Peserta 3"
          />
        )}

        {/* Asal Instansi */}
        <FormInput
          label="Asal Instansi"
          icon={Building2}
          required
          value={formData.asal_instansi}
          onChange={(e) => setFormData({ ...formData, asal_instansi: e.target.value })}
          placeholder="Sekolah/Kampus"
        />

        {/* WhatsApp */}
        <FormInput
          label="WhatsApp"
          icon={Phone}
          required
          type="tel"
          value={formData.whatsapp}
          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          placeholder="08..."
        />

        {/* Container Jenjang */}
        <div className="space-y-1">
          {/* Label */}
          <label className="text-slate-950 text-[14.5px] md:text-[15px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">Jenjang</label>

          {/* Container Opsi Jenjang */}
          <div className="relative group">
            {/* Icon */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <GraduationCap size={14} className="text-slate-400 group-focus-within:text-[#0B255D]" />
            </div>

            {/* Opsi Jenjang */}
            <select required value={formData.jenjang} onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })} className="w-full text-[14px] md:text-[14.5px] lg:text-[13px] xl:text-[13.5px] 2xl:text-[14px] tracking-tight bg-white border-2 border-slate-200 text-slate-950 rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:border-[#0B255D] transition-all duration-300 font-medium appearance-none cursor-pointer">
              <option value="">Pilih Jenjang</option>
              {dapatkanOpsiJenjang().map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>

            {/* Icon Panah Dropdown */}
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
        </div>

        {/* Container Bukti Transfer */}
        <div className={`space-y-2 pt-1 ${apakahKelompokMaks3 ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}>
          {/* Label */}
          <label className="text-slate-950 text-[12.5px] font-semibold ml-1">Bukti Transfer</label>

          {/* Container Input Bukti Transfer */}
          <div className="flex gap-3 flex-col sm:flex-row">
            {/* Prantinjau Bukti Transfer */}
            {previewBukti && (
              <div className="w-32 aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                <img src={previewBukti} alt="Pratinjau Bukti" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Container Input File */}
            <div className="flex-1 relative group border-2 border-dashed border-slate-300 rounded-xl p-2.5 text-center hover:border-[#0B255D] transition-all bg-slate-50/50 flex flex-col items-center justify-center min-h-[44px]">
              {/* Input File */}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={tanganiFileChange}
              />

              {/* Icon dan Place Holder */}
              <div className="flex items-center justify-center gap-2">
                <Upload size={14} className="text-slate-400 group-hover:text-[#0B255D]" />
                <span className="text-[11px] font-semibold text-slate-950 truncate max-w-[200px]">
                  {buktiTransfer ? buktiTransfer.name : (apakahKelompokMaks3 ? 'Klik untuk mengunggah bukti pembayaran' : 'Unggah Bukti')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

export default TambahPeserta;
