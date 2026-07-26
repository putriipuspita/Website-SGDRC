'use client';
import React, { useState } from 'react';
// Import Icon
import { Upload, FileText, Eye, Save, Sliders, MoveVertical, Type, Award, ChevronDown } from 'lucide-react';

// Import Komponent
import toast from 'react-hot-toast';
import KwitansiPendaftaran from '@/components/peserta/bukti-pendaftaran/RegistrationReceipt';
import { fetchDenganToken } from '@/lib/apiClient';
import { muatFontSertifikat } from '@/lib/pdfHelper';

// Sub-komponen Input File Template Sertifikat
const InputTemplateSertifikat = ({ label, value, tipe, modeEdit, onChange, getNamaFile }) => (
  <div className="space-y-2">
    <label className="text-slate-950 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">{label}</label>
    <div className="relative group">
      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 z-0" size={14} />
      <input
        type="text"
        readOnly
        value={getNamaFile(value)}
        className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-xl text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-medium outline-none transition-all ${modeEdit ? 'bg-white border-[#16B9FF] text-slate-950 cursor-pointer' : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}
      />
      <input
        type="file"
        accept="image/png"
        onChange={(e) => onChange(e, tipe)}
        disabled={!modeEdit}
        className={`absolute inset-0 opacity-0 z-10 ${modeEdit ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
        <Upload size={14} className={modeEdit ? 'text-[#16B9FF]' : ''} />
      </div>
    </div>
  </div>
);
 
// Sub-komponen Input File Legalitas (Logo, TTD, Cap)
const InputLegalitas = ({ label, path, tipe, modeEdit, onChange }) => (
  <div className="space-y-2">
    <label className="text-slate-950 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">{label}</label>
    <div className="relative h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
      {path ? (
        <img src={path} className="h-full w-full object-contain" alt={label} />
      ) : (
        <Upload size={20} className="text-slate-300" />
      )}
      {modeEdit && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange(e, tipe)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      )}
    </div>
  </div>
);
 
// Sub-komponen Input Slider Konfigurasi
const SliderConfigCard = ({ judul, ikon: Ikon, ikonColor, fields, min, max, currentConfig, updateConfig, modeEdit, accentClass }) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
    <div className="flex items-center gap-2 mb-1">
      <Ikon size={14} className={ikonColor} />
      <span className="text-[11.5px] xl:text-[12px] 2xl:text-[13px] font-bold text-slate-950">{judul}</span>
    </div>
    {fields.map((field) => (
      <div key={field} className="flex flex-col gap-1">
        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
          <span>{field.replace('y_', '').replace('size_', '')}</span>
          <span>{currentConfig[field] || 0}{judul.includes('Posisi') ? '%' : 'px'}</span>
        </div>
        <input
          type="range"
          disabled={!modeEdit}
          min={min}
          max={max}
          value={currentConfig[field] || 0}
          onChange={(e) => updateConfig(field, parseInt(e.target.value))}
          className={`w-full h-1 ${accentClass}`}
        />
      </div>
    ))}
  </div>
);

// Pemetaan Gaya Font
const pemetaanFont = {
  'Cinzel': { bold: 'toggle', italic: 'force-normal', hanya_kapital: true },
  'Playfair Display': { bold: 'toggle', italic: 'toggle' },
  'Lora': { bold: 'toggle', italic: 'toggle' },
  'Merriweather': { bold: 'toggle', italic: 'toggle' },
  'Instrument Serif': { bold: 'toggle', italic: 'toggle' },
  'DM Serif Text': { bold: 'toggle', italic: 'toggle' },
  'Montserrat': { bold: 'force-bold', italic: 'toggle' },
  'Roboto': { bold: 'toggle', italic: 'toggle' },
  'Poppins': { bold: 'toggle', italic: 'toggle' },
  'Oswald': { bold: 'toggle', italic: 'force-normal' },
  'Anton': { bold: 'force-bold', italic: 'force-normal' },
  'Great Vibes': { bold: 'force-normal', italic: 'force-normal' },
  'Alex Brush': { bold: 'force-normal', italic: 'force-normal' },
  'Dancing Script': { bold: 'toggle', italic: 'force-normal' },
  'Parisienne': { bold: 'force-normal', italic: 'force-normal' },
  'Satisfy': { bold: 'force-normal', italic: 'force-normal' },
  'Pinyon Script': { bold: 'force-normal', italic: 'force-normal' },
  'Yellowtail': { bold: 'force-normal', italic: 'force-normal' },
  'Lobster Two': { bold: 'toggle', italic: 'toggle' }
};

// Komponen Utama Sertifikat
const Sertifikat = ({ data, onSave, sedangMenyimpan, prosesUploadFile }) => {
  const [configTab, setConfigTab] = useState('sertifikat');
  const [modeEdit, setModeEdit] = useState(false);
  const [sertifikatPeserta, setSertifikatPeserta] = useState(data.sertifikat_peserta || '');
  const [sertifikatJuara, setSertifikatJuara] = useState(data.sertifikat_juara || '');
  const [nomorMulai, setNomorMulai] = useState(data.sertifikat_nomor_mulai || '001');
  const [nomorMulaiJuara, setNomorMulaiJuara] = useState(data.sertifikat_nomor_mulai_juara || '001');
  const [formatNomor, setFormatNomor] = useState(data.sertifikat_format_nomor || '[no]/SPH/PAN-SGDRC/XII/2024');
  const [previewTipe, setPreviewTipe] = useState('peserta');
  const [apakahDropdownFontTerbuka, setApakahDropdownFontTerbuka] = useState(false);

  // State Konfigurasi Peserta
  const [configPeserta, setConfigPeserta] = useState(data.sertifikat_config_peserta ? JSON.parse(data.sertifikat_config_peserta) : {
    y_nomor: 33, y_nama: 48, y_status: 62, y_kategori: 72,
    size_nomor: 11, size_nama: 32, size_status: 18, size_kategori: 13,
    font_nama: 'Cinzel', apakah_tebal: true, apakah_miring: false, format_huruf: 'uppercase'
  });

  // State Konfigurasi Juara
  const [configJuara, setConfigJuara] = useState(data.sertifikat_config_juara ? JSON.parse(data.sertifikat_config_juara) : {
    y_nomor: 33, y_nama: 48, y_status: 62, y_kategori: 72,
    size_nomor: 11, size_nama: 32, size_status: 18, size_kategori: 13,
    font_nama: 'Cinzel', apakah_tebal: true, apakah_miring: false, format_huruf: 'uppercase'
  });

  const currentConfig = previewTipe === 'peserta' ? configPeserta : configJuara;

  const infoFont = pemetaanFont[currentConfig.font_nama || 'Cinzel'] || { bold: 'toggle', italic: 'toggle' };
  const apakahBisaBold = infoFont.bold === 'toggle';
  const apakahBisaItalic = infoFont.italic === 'toggle';

  // Sinkronisasi Data ke State Komponen
  React.useEffect(() => {
    // Jika Data Tersedia
    if (data) {
      setSertifikatPeserta(data.sertifikat_peserta || '');
      setSertifikatJuara(data.sertifikat_juara || '');
      setNomorMulai(data.sertifikat_nomor_mulai || '001');
      setNomorMulaiJuara(data.sertifikat_nomor_mulai_juara || '001');
      setFormatNomor(data.sertifikat_format_nomor || '[no]/SPH/PAN-SGDRC/XII/2024');

      // Sertifikat Peserta
      if (data.sertifikat_config_peserta) {
        try {
          setConfigPeserta(JSON.parse(data.sertifikat_config_peserta));
        } catch (e) { }
      }

      // Sertifikat Juara
      if (data.sertifikat_config_juara) {
        try {
          setConfigJuara(JSON.parse(data.sertifikat_config_juara));
        } catch (e) { }
      }
    }
  }, [data]);

  // Efek Pemuatan Font
  React.useEffect(() => {
    if (currentConfig && currentConfig.font_nama) {
      muatFontSertifikat([currentConfig.font_nama], currentConfig.apakah_tebal, currentConfig.apakah_miring).catch(err => {
        console.error("Gagal memuat font preview:", err);
      });

      const infoFont = pemetaanFont[currentConfig.font_nama] || { bold: 'toggle', italic: 'toggle' };
      if (infoFont.bold === 'force-bold' && !currentConfig.apakah_tebal) {
        updateConfig('apakah_tebal', true);
      } else if (infoFont.bold === 'force-normal' && currentConfig.apakah_tebal) {
        updateConfig('apakah_tebal', false);
      }

      if (infoFont.italic === 'force-bold' && !currentConfig.apakah_miring) {
        updateConfig('apakah_miring', true);
      } else if (infoFont.italic === 'force-normal' && currentConfig.apakah_miring) {
        updateConfig('apakah_miring', false);
      }

      if (infoFont.hanya_kapital && currentConfig.format_huruf !== 'uppercase') {
        updateConfig('format_huruf', 'uppercase');
      }
    }
  }, [currentConfig?.font_nama, currentConfig?.apakah_tebal, currentConfig?.apakah_miring]);

  // List Font
  const listFont = [
    // Serif (Elegant & Classic)
    { name: 'Cinzel', value: 'Cinzel' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Lora', value: 'Lora' },
    { name: 'Merriweather', value: 'Merriweather' },
    { name: 'Instrument Serif', value: 'Instrument Serif' },
    { name: 'DM Serif Text', value: 'DM Serif Text' },

    // Sans-Serif (Modern & Clean)
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Oswald', value: 'Oswald' },
    { name: 'Anton', value: 'Anton' },

    // Script & Calligraphy (Beautiful Script)
    { name: 'Great Vibes', value: 'Great Vibes' },
    { name: 'Alex Brush', value: 'Alex Brush' },
    { name: 'Dancing Script', value: 'Dancing Script' },
    { name: 'Parisienne', value: 'Parisienne' },
    { name: 'Satisfy', value: 'Satisfy' },
    { name: 'Pinyon Script', value: 'Pinyon Script' },
    { name: 'Yellowtail', value: 'Yellowtail' },
    { name: 'Lobster Two', value: 'Lobster Two' }
  ];

  // State Surat Bukti
  const [ketuaNama, setKetuaNama] = useState(data.ketua_pelaksana || '');
  const [pathTtd, setPathTtd] = useState(data.path_ttd || '');
  const [pathCap, setPathCap] = useState(data.path_cap || '');
  const [pathLogo, setPathLogo] = useState(data.path_logo_robotika || '');
  const [pathLogoSgdrc, setPathLogoSgdrc] = useState(data.path_logo_sgdrc || '');

  // Update Konfigurasi
  const updateConfig = (field, value) => {
    if (previewTipe === 'peserta') setConfigPeserta(prev => ({ ...prev, [field]: value }));
    else setConfigJuara(prev => ({ ...prev, [field]: value }));
  };


  // Fungsi Upload Sertifikat
  const tanganiUpload = async (e, tipe) => {
    const file = e.target.files[0];
    if (!file) return;
    // Folder Upload
    const folder = ['peserta', 'juara'].includes(tipe) ? 'sertifikat' : 'legal';
    const path = await prosesUploadFile(file, folder, "Mengunggah...");

    // Menentukan Tempat Penyimpanan
    if (path) {
      if (tipe === 'peserta') setSertifikatPeserta(path);
      else if (tipe === 'juara') setSertifikatJuara(path);
      else if (tipe === 'ttd') setPathTtd(path);
      else if (tipe === 'cap') setPathCap(path);
      else if (tipe === 'logo_robotika') setPathLogo(path);
      else if (tipe === 'logo_sgdrc') setPathLogoSgdrc(path);
      toast.success("Berhasil diunggah");
    }
  };

  // Fungsi Mengatur Nama File
  const getNamaFile = (path) => {
    if (!path) return 'Belum ada file';
    return path.split('/').pop();
  };

  // Fungsi Simpan Perubahan
  const simpanPerubahan = () => {
    onSave({
      umum: {
        sertifikat_peserta: sertifikatPeserta,
        sertifikat_juara: sertifikatJuara,
        sertifikat_nomor_mulai: nomorMulai,
        sertifikat_nomor_mulai_juara: nomorMulaiJuara,
        sertifikat_format_nomor: formatNomor,
        sertifikat_config_peserta: JSON.stringify(configPeserta),
        sertifikat_config_juara: JSON.stringify(configJuara),
        ketua_pelaksana: ketuaNama,
        path_ttd: pathTtd,
        path_cap: pathCap,
        path_logo_robotika: pathLogo,
        path_logo_sgdrc: pathLogoSgdrc
      }
    });
    setModeEdit(false);
  };

  return (
    // Halaman Bagian Sertifikat
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 animate-in fade-in duration-700">
      {/* Memuat Fonts */}
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${(currentConfig.font_nama || 'Cinzel').replace(/ /g, '+')}${
          currentConfig.apakah_miring && currentConfig.apakah_tebal
            ? ':ital,wght@1,700'
            : currentConfig.apakah_miring
            ? ':ital,wght@1,400'
            : currentConfig.apakah_tebal
            ? ':wght@700'
            : ''
        }&display=swap`}
      />

      {/* Container Isi Dokument */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:h-[580px] xl:h-[640px] 2xl:h-[700px]">

          {/* Container Header */}
          <div className="bg-[#0B255D] p-1 flex items-center gap-1">
            {/* Tombol Sertifikat */}
            <button onClick={() => setConfigTab('sertifikat')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${configTab === 'sertifikat' ? 'bg-white text-[#0B255D] shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
              <Award size={14} /> Sertifikat
            </button>

            {/* Tombol Surat Bukti */}
            <button onClick={() => setConfigTab('surat')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${configTab === 'surat' ? 'bg-white text-[#0B255D] shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
              <FileText size={14} /> Surat Bukti
            </button>
          </div>

          {/* Container Isi Dokument */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {configTab === 'sertifikat' ? (
              // Bagian Sertifikat
              <div className="space-y-6 animate-in slide-in-from-left duration-300">
                {/* Template Sertifikat Peserta */}
                <InputTemplateSertifikat
                  label="Template Peserta (PNG)"
                  value={sertifikatPeserta}
                  tipe="peserta"
                  modeEdit={modeEdit}
                  onChange={tanganiUpload}
                  getNamaFile={getNamaFile}
                />

                {/* Template Sertifikat Juara */}
                <InputTemplateSertifikat
                  label="Template Juara (PNG)"
                  value={sertifikatJuara}
                  tipe="juara"
                  modeEdit={modeEdit}
                  onChange={tanganiUpload}
                  getNamaFile={getNamaFile}
                />

                {/* Format Nomor Sertifikat */}
                <div className="space-y-2">
                  <label className="text-slate-950 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">Format Nomor Sertifikat</label>
                  <input type="text" value={formatNomor} disabled={!modeEdit} onChange={(e) => setFormatNomor(e.target.value)} className={`w-full px-4 py-2 border-2 rounded-xl outline-none text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-medium ${modeEdit ? 'bg-white border-slate-200 text-slate-950' : 'bg-slate-50 border-slate-100 text-slate-400'}`} />
                </div>

                {/* Container Nomor Mulai */}
                <div className="grid grid-cols-2 gap-4">
                  {/* No Mulai Peserta */}
                  <div className="space-y-2">
                    <label className="text-slate-950 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">No. Mulai Peserta</label>
                    <input type="number" value={nomorMulai} disabled={!modeEdit} onChange={(e) => setNomorMulai(e.target.value)} className={`w-full px-4 py-2 border-2 rounded-xl outline-none text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-medium ${modeEdit ? 'bg-white border-slate-200 text-slate-950' : 'bg-slate-50 border-slate-100 text-slate-400'}`} />
                  </div>

                  {/* No Mulai Juara */}
                  <div className="space-y-2">
                    <label className="text-slate-950 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">No. Mulai Juara</label>
                    <input type="number" value={nomorMulaiJuara} disabled={!modeEdit} onChange={(e) => setNomorMulaiJuara(e.target.value)} className={`w-full px-4 py-2 border-2 rounded-xl outline-none text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-medium ${modeEdit ? 'bg-white border-slate-200 text-slate-950' : 'bg-slate-50 border-slate-100 text-slate-400'}`} />
                  </div>
                </div>

                {/* Jenis Font Nama */}
                <div className="space-y-2 relative">
                  <label className="text-slate-950 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">Jenis Font Nama ({previewTipe === 'peserta' ? 'Peserta' : 'Juara'})</label>
                  {!modeEdit ? (
                    <input
                      type="text"
                      readOnly
                      value={currentConfig.font_nama || 'Cinzel'}
                      className="w-full px-4 py-2 border-2 rounded-xl outline-none text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-normal bg-slate-50 border-slate-100 text-slate-400"
                    />
                  ) : (
                    <div>
                      {/* Tombol Pemicu Dropdown */}
                      <button
                        type="button"
                        onClick={() => setApakahDropdownFontTerbuka(!apakahDropdownFontTerbuka)}
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                        className="w-full px-4 py-2 border-2 rounded-xl outline-none text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-normal bg-white border-slate-200 text-slate-800 flex items-center justify-between transition-all hover:bg-slate-50 text-left"
                      >
                        <span>{currentConfig.font_nama || 'Cinzel'}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${apakahDropdownFontTerbuka ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Menu List Dropdown */}
                      {apakahDropdownFontTerbuka && (
                        <>
                          {/* Backdrop untuk menutup dropdown saat klik luar */}
                          <div className="fixed inset-0 z-40" onClick={() => setApakahDropdownFontTerbuka(false)} />
                          
                          <div className="absolute left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto custom-scrollbar divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                            {listFont.map(font => (
                              <button
                                key={font.value}
                                type="button"
                                onClick={() => {
                                  updateConfig('font_nama', font.value);
                                  setApakahDropdownFontTerbuka(false);
                                }}
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                                className={`w-full text-left px-4 py-2 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] transition-all ${
                                  (currentConfig.font_nama || 'Cinzel') === font.value
                                    ? 'bg-slate-100 font-bold text-[#0B255D]'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                {font.name}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Pengaturan Gaya Font Nama */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Gaya Tebal */}
                  <div className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                    !modeEdit
                      ? 'bg-slate-50 border-slate-100 text-slate-600'
                      : apakahBisaBold
                      ? 'bg-slate-50 border-slate-200 text-slate-950'
                      : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                  }`}>
                    <span className="text-[12px] font-semibold">Tebal (Bold)</span>
                    <label className={`relative inline-flex items-center ${apakahBisaBold && modeEdit ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      <input
                        type="checkbox"
                        disabled={!modeEdit || !apakahBisaBold}
                        checked={!!currentConfig.apakah_tebal}
                        onChange={(e) => updateConfig('apakah_tebal', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#0B255D] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full ${!modeEdit ? 'peer-checked:bg-slate-400' : ''}`}></div>
                    </label>
                  </div>

                  {/* Gaya Miring */}
                  <div className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                    !modeEdit
                      ? 'bg-slate-50 border-slate-100 text-slate-600'
                      : apakahBisaItalic
                      ? 'bg-slate-50 border-slate-200 text-slate-950'
                      : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                  }`}>
                    <span className="text-[12px] font-semibold">Miring (Italic)</span>
                    <label className={`relative inline-flex items-center ${apakahBisaItalic && modeEdit ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      <input
                        type="checkbox"
                        disabled={!modeEdit || !apakahBisaItalic}
                        checked={!!currentConfig.apakah_miring}
                        onChange={(e) => updateConfig('apakah_miring', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#0B255D] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full ${!modeEdit ? 'peer-checked:bg-slate-400' : ''}`}></div>
                    </label>
                  </div>
                </div>

                {/* Pengaturan Format Huruf Nama */}
                <div className="space-y-2">
                  <label className="text-slate-950 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">Format Huruf Nama</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['KAPITAL', 'Judul', 'kecil'].map((format) => {
                      const apakahTombolDisabled = infoFont.hanya_kapital && format !== 'KAPITAL';
                      return (
                        <button
                          key={format}
                          type="button"
                          disabled={!modeEdit || apakahTombolDisabled}
                          onClick={() => updateConfig('format_huruf', format === 'KAPITAL' ? 'uppercase' : format === 'Judul' ? 'capitalize' : 'lowercase')}
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                          className={`py-2 px-3 text-[11px] font-bold rounded-xl border transition-all ${
                            !modeEdit
                              ? (currentConfig.format_huruf || 'uppercase') === (format === 'KAPITAL' ? 'uppercase' : format === 'Judul' ? 'capitalize' : 'lowercase')
                                ? 'bg-slate-200 border-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                              : apakahTombolDisabled
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : (currentConfig.format_huruf || 'uppercase') === (format === 'KAPITAL' ? 'uppercase' : format === 'Judul' ? 'capitalize' : 'lowercase')
                              ? 'bg-[#0B255D] border-[#0B255D] text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95'
                          }`}
                        >
                          {format === 'KAPITAL' ? 'Kapital Semua' : format === 'Judul' ? 'Kapital Awal' : 'Kecil Semua'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Container Slider */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Slider Posisi */}
                  <SliderConfigCard
                    judul="Posisi (Y%)"
                    ikon={MoveVertical}
                    ikonColor="text-[#16B9FF]"
                    fields={['y_nomor', 'y_nama', 'y_status', ...(previewTipe === 'juara' ? ['y_kategori'] : [])]}
                    min={0}
                    max={100}
                    currentConfig={currentConfig}
                    updateConfig={updateConfig}
                    modeEdit={modeEdit}
                    accentClass="accent-[#16B9FF]"
                  />

                  {/* Slider Ukuran */}
                  <SliderConfigCard
                    judul="Ukuran (PX)"
                    ikon={Type}
                    ikonColor="text-[#F43F5E]"
                    fields={['size_nomor', 'size_nama', 'size_status', ...(previewTipe === 'juara' ? ['size_kategori'] : [])]}
                    min={5}
                    max={100}
                    currentConfig={currentConfig}
                    updateConfig={updateConfig}
                    modeEdit={modeEdit}
                    accentClass="accent-rose-500"
                  />
                </div>
              </div>
            ) : (

              // Bagian Surat Bukti
              <div className="space-y-5 animate-in slide-in-from-right duration-300">
                {/* Nama Ketua Pelaksana */}
                <div className="space-y-2">
                  <label className="text-slate-950 text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-semibold ml-1">Nama Ketua Pelaksana</label>
                  <input type="text" value={ketuaNama} disabled={!modeEdit} onChange={(e) => setKetuaNama(e.target.value)} className={`w-full px-4 py-2.5 border-2 rounded-xl text-[12.5px] lg:text-[12.2px] xl:text-[12.9px] 2xl:text-[13.7px] font-medium ${modeEdit ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 text-slate-400'}`} />
                </div>

                {/* Container Logo */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Logo Robotika */}
                  <InputLegalitas
                    label="Logo Robotika"
                    path={pathLogo}
                    tipe="logo_robotika"
                    modeEdit={modeEdit}
                    onChange={tanganiUpload}
                  />

                  {/* Logo SGDRC */}
                  <InputLegalitas
                    label="Logo SGDRC"
                    path={pathLogoSgdrc}
                    tipe="logo_sgdrc"
                    modeEdit={modeEdit}
                    onChange={tanganiUpload}
                  />
                </div>

                {/* Container Legalitas */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Tanda Tangan */}
                  <InputLegalitas
                    label="Tanda Tangan"
                    path={pathTtd}
                    tipe="ttd"
                    modeEdit={modeEdit}
                    onChange={tanganiUpload}
                  />

                  {/* Cap Stempel */}
                  <InputLegalitas
                    label="Cap Stempel"
                    path={pathCap}
                    tipe="cap"
                    modeEdit={modeEdit}
                    onChange={tanganiUpload}
                  />
                </div>
              </div>
            )}

            {/* Tombol Simpan atau Edit */}
            <button onClick={() => { if (modeEdit) simpanPerubahan(); else setModeEdit(true); }} disabled={sedangMenyimpan} className="w-full py-3 rounded-xl text-[13px] font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-[#0B255D] hover:bg-blue-500 text-white mt-4">
              {sedangMenyimpan ? 'Menyimpan...' : (modeEdit ? <><Save size={16} /> Simpan Perubahan</> : <><Sliders size={16} /> Edit Pengaturan</>)}
            </button>
          </div>
        </div>
      </div>

      {/* Container Preview */}
      <div className="lg:col-span-7">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:h-[580px] xl:h-[640px] 2xl:h-[700px]">

          {/* Container Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2"><Eye size={16} className="text-[#16B9FF]" /><span className="text-[12px] font-black text-[#0B255D] uppercase">Preview</span></div>
            {configTab === 'sertifikat' && (
              <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                {['peserta', 'juara'].map(tipe => (
                  <button
                    key={tipe}
                    onClick={() => setPreviewTipe(tipe)}
                    className={`px-4 py-1.5 rounded-md text-[10.5px] xl:text-[11.2px] 2xl:text-[12.2px] font-bold transition-all ${previewTipe === tipe ? 'bg-[#16B9FF] text-white shadow-sm' : 'text-slate-950 hover:bg-slate-100'}`}
                  >
                    {tipe.charAt(0).toUpperCase() + tipe.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Container Tampilan */}
          <div className="flex-1 p-4 bg-slate-100/50 overflow-auto">
            {configTab === 'sertifikat' ? (
              <div className="relative h-[450px] w-fit bg-white shadow-2xl mx-auto overflow-hidden">
                {(previewTipe === 'peserta' ? sertifikatPeserta : sertifikatJuara) ? (
                  <>
                    <img src={previewTipe === 'peserta' ? sertifikatPeserta : sertifikatJuara} className="h-full w-auto" />
                    {/* Overlay Teks Dinamis Sertifikat */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center">

                      {/* Nomor */}
                      <div
                        style={{
                          top: `${currentConfig.y_nomor}%`,
                          fontSize: `${currentConfig.size_nomor * 0.9}px`,
                          fontFamily: 'Montserrat, sans-serif',
                          lineHeight: 1
                        }}
                        className="absolute w-full text-center text-black"
                      >
                        Nomor: {formatNomor.replace('[no]', previewTipe === 'peserta' ? nomorMulai : nomorMulaiJuara)}
                      </div>

                      {/* Nama */}
                      <div
                        style={{
                          top: `${currentConfig.y_nama}%`,
                          fontSize: `${currentConfig.size_nama * 0.9}px`,
                          fontFamily: `"${currentConfig.font_nama || 'Cinzel'}", serif`,
                          fontWeight: currentConfig.apakah_tebal ? 'bold' : 'normal',
                          fontStyle: currentConfig.apakah_miring ? 'italic' : 'normal',
                          lineHeight: 1
                        }}
                        className="absolute w-full text-center text-black"
                      >
                        {(currentConfig.format_huruf === 'lowercase')
                          ? 'nama peserta contoh'
                          : (currentConfig.format_huruf === 'capitalize')
                          ? 'Nama Peserta Contoh'
                          : 'NAMA PESERTA CONTOH'}
                      </div>

                      {/* Status */}
                      <div
                        style={{
                          top: `${currentConfig.y_status}%`,
                          fontSize: `${currentConfig.size_status * 0.9}px`,
                          fontFamily: 'Montserrat, sans-serif',
                          lineHeight: 1
                        }}
                        className={`absolute w-full text-center font-bold ${previewTipe === 'juara' ? 'text-white' : 'text-black'}`}
                      >
                        {previewTipe === 'peserta' ? `PESERTA ROBOT SOCCER SENIOR` : 'JUARA 1'}
                      </div>

                      {/* Kategori Lomba (Hanya di Juara) */}
                      {previewTipe === 'juara' && (
                        <div
                          style={{
                            top: `${currentConfig.y_kategori}%`,
                            fontSize: `${(currentConfig.size_kategori || 13) * 0.9}px`,
                            fontFamily: 'Montserrat, sans-serif',
                            lineHeight: 1
                          }}
                          className="absolute w-full text-center font-bold uppercase text-black"
                        >
                          KATEGORI ROBOT SOCCER SENIOR
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full px-20 flex items-center text-slate-300 font-bold uppercase tracking-widest border-2 border-dashed border-slate-200">No Template</div>
                )}
              </div>
            ) : (

              // Tampilan Preview Unduh Bukti
              <div className="bg-white border border-slate-200 rounded-xl p-0 max-w-[650px] mx-auto shadow-sm overflow-hidden h-[500px] relative flex justify-center bg-slate-50/30">
                <div className="scale-[0.42] origin-top translate-y-2">
                  <KwitansiPendaftaran
                    pengaturan={{
                      ketua_pelaksana: ketuaNama,
                      path_ttd: pathTtd,
                      path_cap: pathCap,
                      path_logo_robotika: pathLogo,
                      path_logo_sgdrc: pathLogoSgdrc
                    }}
                    data={{
                      id: 1,
                      lomba: "ROBOT SOCCER SENIOR",
                      tim: "TIM CONTOH SGDRC",
                      peserta: ["PESERTA CONTOH 1", "PESERTA CONTOH 2"],
                      jenjang: "Mahasiswa",
                      instansi: "Universitas Sunan Gunung Djati"
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sertifikat;
