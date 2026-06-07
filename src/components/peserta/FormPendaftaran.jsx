'use client';
import React, { useState } from 'react';
// Import Icon dan Notifikasi
import { ChevronLeft, ArrowLeft, Upload, Info, Eye, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Import Utility
import { fetchDenganToken } from '../../lib/apiClient';

// Sub-Komponen untuk Input Upload Berkas
const InputFilePendaftaran = ({ id, label, file, ikonSrc, ikonAlt, bgIkon, accept, onChange, onPreview }) => {
  return (
    <div className="bg-white p-2 rounded-xl border-2 border-gray-300 flex items-center justify-between group hover:border-[#16B9FF] transition-all cursor-pointer shadow-sm gap-2">
      {/* Icon dan Label Berkas */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        <div className={`w-10 h-10 rounded-lg ${bgIkon} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
          <img src={ikonSrc} alt={ikonAlt} className="w-full h-full object-cover" />
        </div>
        <div className="text-left min-w-0 flex-1">
          <p className="text-[11px] md:text-[12px] font-bold text-black leading-tight md:leading-relaxed break-words">{label}</p>
        </div>
      </div>

      {/* Input File & Tombol Kontrol */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="file"
          id={id}
          className="hidden"
          accept={accept}
          onChange={onChange}
        />

        {/* Tombol Preview */}
        {file && (
          <button
            onClick={onPreview}
            className="w-7 h-7 flex items-center justify-center bg-blue-50 text-[#16B9FF] rounded-md border border-blue-100 hover:bg-blue-100 transition-all"
          >
            <Eye size={14} />
          </button>
        )}

        {/* Label Status / Tombol Pilih File */}
        <label
          htmlFor={id}
          className={`px-3 py-1 ${file ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'} hover:bg-[#16B9FF] hover:text-white text-[9px] font-sans font-bold rounded-md transition-all flex-shrink-0 cursor-pointer`}
        >
          {file ? 'Terpilih' : 'Pilih File'}
        </label>
      </div>
    </div>
  );
};

// Sub-Komponen untuk Input Teks agar kode pendaftaran lebih ringkas dan efisien
const InputTeksPendaftaran = ({ label, type = "text", name, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="block text-[12px] font-bold text-black tracking-normal mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-1.5 rounded-lg border-2 border-gray-300 focus:border-[#16B9FF] focus:ring-0 outline-none transition-all font-sans font-bold text-[12px] text-black placeholder:text-gray-400 placeholder:font-normal placeholder:text-[11px]"
      />
    </div>
  );
};

const FormPendaftaran = ({ lomba, kembali }) => {

  // Menyimpan Data Input Formulir Pendaftaran
  const [dataFormulir, setDataFormulir] = useState({
    namaTim: '',
    peserta1: '',
    peserta2: '',
    peserta3: '',
    asalInstansi: '',
    jenjang: '',
    whatsapp: '',
  });

  // Menyimpan Data Berkas
  const [berkas, setBerkas] = useState({
    kartuSiswa: null,
    ikutiInstagram: null,
    ikutiInstagramRobotika: null,
    ikutiTiktok: null,
    buktiBayar: null,
  });

  // State Tambahan (Loading, Pesan Error, Preview)
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesan, setPesan] = useState({ tipe: '', isi: '' });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tipeFilePreview, setTipeFilePreview] = useState('');
  const [pengaturan, setPengaturan] = useState(null);

  // Mengambil Data Pengaturan Dari Database
  React.useEffect(() => {
    fetch('/api/pengaturan')
      .then(res => res.json())
      .then(data => setPengaturan(data))
      .catch(err => console.error("Gagal ambil pengaturan:", err));
  }, []);

  // Fungsi Melihat File
  const tanganiPreview = (file) => {
    if (file) {
      // Hapus URL Lama
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      // Simpan URL Baru
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setTipeFilePreview(file.type);
    }
  };

  // Logika Menentukan Jumlah Input Nama Peserta
  const ekstrakAngka = lomba?.tim?.match(/\d+/g) || [];
  const maxAnggota = ekstrakAngka.length > 0 ? Math.max(...ekstrakAngka.map(Number)) : 2;

  const isSolo = maxAnggota === 1;
  const isTeam3 = maxAnggota === 3;

  // Fungsi Saat Input Ada Isinya
  const tanganiPerubahanInput = (acara) => {
    const { name, value } = acara.target;
    setDataFormulir(prev => ({ ...prev, [name]: value }));
    setPesan({ tipe: '', isi: '' });
  };

  // Fungsi Saat File Sudah Terupload
  const tanganiPerubahanBerkas = (nama, acara) => {
    const file = acara.target.files[0];
    if (file) {
      setBerkas(prev => ({ ...prev, [nama]: file }));
      setPesan({ tipe: '', isi: '' });
    }
  };

  // Fungsi Tombol Kirim
  const tanganiKirim = async (acara) => {
    acara.preventDefault();
    setPesan({ tipe: '', isi: '' });

    // Daftar aturan validasi terstruktur
    const daftarValidasi = [
      { kondisi: maxAnggota > 1 && !dataFormulir.namaTim, pesan: 'Harap Isi Nama Tim' },
      { kondisi: !dataFormulir.peserta1, pesan: 'Harap Isi Nama Peserta 1' },
      { kondisi: maxAnggota >= 2 && !dataFormulir.peserta2, pesan: 'Harap Isi Nama Peserta 2' },
      { kondisi: !dataFormulir.asalInstansi, pesan: 'Harap Isi Asal Instansi' },
      { kondisi: !dataFormulir.jenjang, pesan: 'Harap Pilih Jenjang' },
      { kondisi: !dataFormulir.whatsapp, pesan: 'Harap Isi No WhatsApp' },
      { kondisi: !berkas.kartuSiswa, pesan: 'Harap Unggah Foto Kartu Tanda Siswa' },
      { kondisi: !berkas.ikutiInstagram, pesan: 'Harap Unggah Bukti Follow Instagram SGDRC' },
      { kondisi: !berkas.ikutiInstagramRobotika, pesan: 'Harap Unggah Bukti Follow Instagram Robotika' },
      { kondisi: !berkas.ikutiTiktok, pesan: 'Harap Unggah Bukti Follow TikTok' },
      { kondisi: !berkas.buktiBayar, pesan: 'Harap Unggah Bukti Pembayaran' },
    ];

    // Menampilkan Pesan Error
    const errorDitemukan = daftarValidasi.find(item => item.kondisi);

    if (errorDitemukan) {
      setPesan({ tipe: 'error', isi: errorDitemukan.pesan });
      return;
    }

    // Proses Mengirim Data
    setSedangMemuat(true);
    try {
      const formData = new FormData();
      formData.append('lomba_id', lomba.id);
      Object.keys(dataFormulir).forEach(k => formData.append(k, dataFormulir[k]));
      Object.keys(berkas).forEach(k => { if (berkas[k]) formData.append(k, berkas[k]); });

      // Kirim Request ke Backend
      const res = await fetchDenganToken('/api/peserta/daftar', {
        method: 'POST',
        body: formData
      });

      // Jika Formulir Berhasil Di Kirim
      if (res.ok) {
        toast.success('Pendaftaran Berhasil! Sedang diproses admin.');
        setTimeout(() => kembali(), 1500);
      }
      // Jika Formulir Gagal Di Kirim
      else {
        const d = await res.json();
        toast.error(d.pesan || 'Gagal Mendaftar');
      }

      // Jika Server Error 
    } catch (err) {
      toast.error('Kesalahan Koneksi Ke Server');
    } finally {
      setSedangMemuat(false);
    }
  };

  return (
    <>
      {/* Bagian Halaman Formulir Pendaftaran */}
      <div className="w-auto -mx-4 md:w-full max-w-[1400px] md:mx-auto px-0 md:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
        {/* Container Formulir Pendaftaran */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.05),0_0_20px_rgba(22,185,255,0.06)] flex flex-col lg:flex-row text-black border border-slate-200/60">

          {/* Container Formulir Sebelah Kiri */}
          <div className="flex-[1.1] p-6 lg:p-8 border-r border-slate-100">
            {/* Judul Formulir */}
            <div className="mb-6 text-left border-l-4 border-[#E40011] pl-6">
              <h2 className="text-xl font-black mb-1 tracking-normal text-black uppercase leading-tight">
                Form Pendaftaran Lomba
              </h2>
              <p className="text-gray-400 text-[9.5px] font-bold tracking-normal uppercase">Lengkapi data tim dan persyaratan</p>
            </div>

            {/* Container Input Formulir */}
            <div className="space-y-6">
              {/* Jenis Lomba */}
              <div>
                <label className="block text-[12px] font-bold text-black tracking-normal mb-2">Jenis Lomba yang Dipilih</label>
                <div className="w-full px-4 py-1.5 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 font-sans font-bold text-[12px] text-[#E40011] uppercase tracking-wider">
                  {lomba?.nama || 'Lomba Tidak Terdeteksi'}
                </div>
              </div>

              {/* Nama Tim */}
              {maxAnggota > 1 && (
                <InputTeksPendaftaran
                  label="Nama Tim"
                  name="namaTim"
                  value={dataFormulir.namaTim}
                  onChange={tanganiPerubahanInput}
                  placeholder="Contoh: Tim Inovator"
                />
              )}

              {/* Input Nama Peserta */}
              {Array.from({ length: maxAnggota }, (_, i) => i + 1).map((nomor) => (
                <InputTeksPendaftaran
                  key={nomor}
                  label={`Nama Peserta ${nomor}`}
                  name={`peserta${nomor}`}
                  value={dataFormulir[`peserta${nomor}`] || ''}
                  onChange={tanganiPerubahanInput}
                  placeholder={`Nama Lengkap Peserta ${nomor}${(maxAnggota === 3 && nomor === 3) ? ' (Opsional)' : ''}`}
                />
              ))}

              {/* Asal Instansi */}
              <InputTeksPendaftaran
                label="Asal Instansi"
                name="asalInstansi"
                value={dataFormulir.asalInstansi}
                onChange={tanganiPerubahanInput}
                placeholder="Nama Sekolah / Instansi"
              />

              {/* Jenjang */}
              <div>
                <label className="block text-[12px] font-bold text-black tracking-normal mb-2">Jenjang</label>
                <select
                  name="jenjang"
                  value={dataFormulir.jenjang}
                  onChange={tanganiPerubahanInput}
                  className="w-full px-4 py-1.5 rounded-lg border-2 border-gray-300 focus:border-[#16B9FF] focus:ring-0 outline-none transition-all font-sans font-bold text-[11px] text-black appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/271/271210.png')] bg-[length:10px] bg-[right_1rem_center] bg-no-repeat cursor-pointer"
                >

                  {/* Fungsi Menampilkan Jenjang Sesuai Tingkat Lomba */}
                  <option value="">Pilih Jenjang</option>
                  {(() => {
                    const teksJenjang = lomba?.jenjang || '';
                    if (!teksJenjang) {
                      return ['TK', 'SD / MI', 'SMP / MTS', 'SMA / SMK / MA', 'Perguruan Tinggi'].map(j => (
                        <option key={j} value={j}>{j}</option>
                      ));
                    }

                    // Fungsi Menampilkan Jenjang Sesuai Umur
                    let daftar = [];
                    const teksKecil = teksJenjang.toLowerCase();
                    const matchUmur = teksKecil.match(/(\d+)\s*tahun/);

                    if (matchUmur) {
                      const angkaUmur = parseInt(matchUmur[1]);
                      if (angkaUmur < 9) {
                        daftar = ['TK', 'SD'];
                      } else {
                        daftar = ['SD'];
                      }
                    } else {
                      daftar = teksJenjang
                        .split(/ - |, | dan | & /i)
                        .map(item => item.trim())
                        .filter(item => item !== "");
                    }

                    const daftarUnik = [...new Set(daftar)];

                    return daftarUnik.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ));
                  })()}
                </select>
              </div>

              {/* No WhatsApp */}
              <InputTeksPendaftaran
                label="No WhatsApp"
                name="whatsapp"
                value={dataFormulir.whatsapp}
                onChange={tanganiPerubahanInput}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          {/* Container Formulir Sebelah Kanan */}
          <div className="flex-1 p-5 lg:p-6 bg-slate-50 flex flex-col border-t lg:border-t-0">
            {/* Judul Upload Dokumen */}
            <h2 className="text-[13px] md:text-[13px] font-bold mb-3 tracking-normal text-black mt-2 md:mt-[30px]">Upload Dokumen</h2>

            {/* Container Upload Berkas */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 mb-6 animate-in zoom-in-95 duration-700">
              <div className="space-y-4">
                {/* Upload Kartu Tanda Siswa */}
                <InputFilePendaftaran
                  id="kartuSiswa"
                  label="Foto Kartu Tanda Siswa"
                  file={berkas.kartuSiswa}
                  ikonSrc="/aset/icon/kartu.png"
                  ikonAlt="Kartu"
                  bgIkon="bg-[#EBF5FF]"
                  accept="image/*,application/pdf"
                  onChange={(e) => tanganiPerubahanBerkas('kartuSiswa', e)}
                  onPreview={() => tanganiPreview(berkas.kartuSiswa)}
                />

                {/* Upload Bukti Follow Instagram SGDRC */}
                <InputFilePendaftaran
                  id="followIg"
                  label="Bukti Follow Instagram SGDRC"
                  file={berkas.ikutiInstagram}
                  ikonSrc="/aset/icon/instagram.png"
                  ikonAlt="Instagram"
                  bgIkon="bg-[#FFF0F0]"
                  accept="image/*,application/pdf"
                  onChange={(e) => tanganiPerubahanBerkas('ikutiInstagram', e)}
                  onPreview={() => tanganiPreview(berkas.ikutiInstagram)}
                />

                {/* Upload Bukti Follow Instagram Robotika */}
                <InputFilePendaftaran
                  id="followIgRobotika"
                  label="Bukti Follow Instagram Robotika"
                  file={berkas.ikutiInstagramRobotika}
                  ikonSrc="/aset/icon/instagram.png"
                  ikonAlt="Instagram"
                  bgIkon="bg-[#FFF0F0]"
                  accept="image/*,application/pdf"
                  onChange={(e) => tanganiPerubahanBerkas('ikutiInstagramRobotika', e)}
                  onPreview={() => tanganiPreview(berkas.ikutiInstagramRobotika)}
                />

                {/* Upload Bukti Follow TikTok */}
                <InputFilePendaftaran
                  id="followTiktok"
                  label="Bukti Follow TikTok"
                  file={berkas.ikutiTiktok}
                  ikonSrc="/aset/icon/tiktok.jpg"
                  ikonAlt="TikTok"
                  bgIkon="bg-black"
                  accept="image/*,application/pdf"
                  onChange={(e) => tanganiPerubahanBerkas('ikutiTiktok', e)}
                  onPreview={() => tanganiPreview(berkas.ikutiTiktok)}
                />

                {/* Upload Bukti Pembayaran */}
                <InputFilePendaftaran
                  id="buktiBayar"
                  label="Bukti Pembayaran"
                  file={berkas.buktiBayar}
                  ikonSrc="/aset/icon/bukti.png"
                  ikonAlt="Bukti"
                  bgIkon="bg-[#E6FFFA]"
                  accept="image/*"
                  onChange={(e) => tanganiPerubahanBerkas('buktiBayar', e)}
                  onPreview={() => tanganiPreview(berkas.buktiBayar)}
                />
              </div>
            </div>

            {/* Container Info Pembayaran*/}
            <div className="bg-[#DEEAFB] p-5 rounded-2xl border border-[#BDD5F7] mb-6 relative overflow-hidden shadow-sm">
              {/* Judul */}
              <h3 className="text-[9px] font-black text-[#1E3A5F] uppercase tracking-[0.1em] mb-2">Informasi Pembayaran</h3>

              {/* Info Pembayaran */}
              <div className="space-y-0.5 relative z-10">
                <p className="text-[12px] font-bold text-[#225AA1]">{pengaturan?.bank_nama || 'Bank BSI (Bank Syariah Indonesia)'}</p>
                <p className="text-xl font-black text-[#0B255D] tracking-wider">{pengaturan?.bank_rekening || '1234567890'}</p>
                <p className="text-[11px] font-black text-[#225AA1] uppercase">a.n. {pengaturan?.bank_atas_nama || `SGD RC ${new Date().getFullYear()}`}</p>
              </div>
              <p className="mt-3 text-[9px] font-bold text-[#1E3A5F]/60 italic">* Setelah membayar, upload bukti pada kolom di atas (Format: Gambar/Foto).</p>
            </div>

            {/* Pesan Error */}
            {pesan.isi && pesan.tipe === 'error' && (
              <div className="p-3 rounded-xl text-[12px] font-bold text-center mb-4 capitalize bg-rose-50 text-rose-500 border border-rose-100 animate-in fade-in zoom-in duration-300">
                {pesan.isi}
              </div>
            )}

            {/* Container Tombol */}
            <div className="flex items-center justify-center gap-4 mt-auto">
              {/* Tombol Batal */}
              <button
                onClick={kembali}
                disabled={sedangMemuat}
                className="px-10 py-2.5 bg-[#0B255D] hover:bg-[#071a42] text-white font-black text-[12px] rounded-xl transition-all uppercase active:scale-[0.98] disabled:opacity-50">
                BATAL
              </button>

              {/* Tombol Kirim */}
              <button
                onClick={tanganiKirim}
                disabled={sedangMemuat}
                className="px-10 py-2.5 bg-[#E40011] hover:bg-[#c3000f] text-white font-black text-[12px] rounded-xl transition-all uppercase active:scale-[0.98] disabled:opacity-50">
                {sedangMemuat ? 'MENGIRIM...' : 'KIRIM'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview Gambar */}
      {previewUrl && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center pt-20 pb-10 px-4 md:pt-24 md:pb-12 md:px-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}></div>
          <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl w-fit max-w-[95vw] max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-300 mx-auto">

            {/* Container Judul dan Tombol X */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-800">Preview Dokumen</h3>
              <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Tampilkan PDF atau Gambar */}
            <div className="flex-1 overflow-auto bg-slate-50 p-2 md:p-6 flex items-center justify-center min-h-[300px]">
              {tipeFilePreview === 'application/pdf' ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[50vh] md:h-[60vh] rounded-xl border border-slate-200"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[50vh] md:max-h-[55vh] object-contain rounded-xl shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormPendaftaran;
