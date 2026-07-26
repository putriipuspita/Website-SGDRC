'use client';
import React, { useState, useEffect } from 'react';

// Import Icon
import {
  Info, LayoutGrid, FileText, Award, Calendar, Image as ImageIcon
} from 'lucide-react';

// Import Komponen
import toast from 'react-hot-toast';
import { fetchDenganToken, fetchPublik } from '@/lib/apiClient';

// Import Sub-Components
import Umum from './menu/Umum';
import Lomba from './menu/Lomba';
import Guidebook from './menu/Guidebook';
import Sertifikat from './menu/Sertifikat';
import Jadwal from './menu/Jadwal';
import Aksi from './menu/Aksi';

// Komponen Utama Informasi
const Informasi = () => {
  const [tabAktif, setTabAktif] = useState('umum');
  const [loading, setLoading] = useState(true);
  const [daftarLombaLanding, setDaftarLombaLanding] = useState([]);
  const [daftarLombaDashboard, setDaftarLombaDashboard] = useState([]);
  const [daftarGuidebook, setDaftarGuidebook] = useState([]);
  const [lombaTerpilih, setLombaTerpilih] = useState(null);
  const [targetLomba, setTargetLomba] = useState('landing'); // 'landing' atau 'dashboard'
  const [guidebookTerpilih, setGuidebookTerpilih] = useState(null);
  const [apakahModalLombaTerbuka, setApakahModalLombaTerbuka] = useState(false);
  const [apakahModalGuidebookTerbuka, setApakahModalGuidebookTerbuka] = useState(false);
  const [apakahModalHapusGbTerbuka, setApakahModalHapusGbTerbuka] = useState(false);
  const [dataGbHapus, setDataGbHapus] = useState(null);
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);

  // State Mode Edit
  const [modeEditUmum, setModeEditUmum] = useState(false);
  const [modeEditGuidebook, setModeEditGuidebook] = useState(false);
  const [modeEditLombaLanding, setModeEditLombaLanding] = useState(false);
  const [modeEditLombaDashboard, setModeEditLombaDashboard] = useState(false);

  // State Pengaturan Umum
  const [umum, setUmum] = useState({
    judul_hero: '',
    deskripsi_hero: '',
    tanggal_event: '',
    wa_link_umum: '',
    grup_wa_peserta: '',
    bank_nama: '',
    bank_rekening: '',
    bank_atas_nama: '',
    ketua_pelaksana: '',
    path_ttd: '',
    path_cap: '',
    path_logo_robotika: '',
    path_logo_sgdrc: '',
    sponsor_list: [],
    whatsapp_list: [],
    link_dokumentasi: '',
    foto_dokumentasi_list: '[]'
  });

  // Fungsi Ambil Data
  const ambilData = async (tampilkanLoading = false) => {
    try {
      if (tampilkanLoading || (daftarLombaLanding.length === 0 && daftarLombaDashboard.length === 0)) {
        setLoading(true);
      }

      // Ambil Data Dari Pengaturan
      const resUmum = await fetchPublik('/api/pengaturan', { cache: 'no-store' });
      if (resUmum.ok) {
        const data = await resUmum.json();
        setUmum(prev => ({
          ...prev,
          // Data Landing Page
          judul_hero: data.judul_hero || '',
          deskripsi_hero: data.deskripsi_hero || '',
          tanggal_event: data.tanggal_event || '',

          // Data Wa
          wa_link_umum: data.wa_link_umum || '',
          grup_wa_peserta: data.grup_wa_peserta || '',
          whatsapp_list: data.whatsapp_list ? JSON.parse(data.whatsapp_list) : [],

          // Data Bank
          bank_nama: data.bank_nama || '',
          bank_rekening: data.bank_rekening || '',
          bank_atas_nama: data.bank_atas_nama || '',

          // Data Sertifikat
          sertifikat_peserta: data.sertifikat_peserta || '',
          sertifikat_juara: data.sertifikat_juara || '',
          sertifikat_nomor_mulai: data.sertifikat_nomor_mulai || '001',
          sertifikat_nomor_mulai_juara: data.sertifikat_nomor_mulai_juara || '001',
          sertifikat_format_nomor: data.sertifikat_format_nomor || '[no]/SPH/PAN-SGDRC/XII/2024',
          sertifikat_config_peserta: data.sertifikat_config_peserta || '',
          sertifikat_config_juara: data.sertifikat_config_juara || '',

          // Data Legalitas
          ketua_pelaksana: data.ketua_pelaksana || 'Sarah Nurul Yakin',
          path_ttd: data.path_ttd || '/aset/legal/ttd putra.png',
          path_cap: data.path_cap || '/aset/legal/cap sgdrc.png',
          path_logo_robotika: data.path_logo_robotika || '/aset/logo/robotika.png',
          path_logo_sgdrc: data.path_logo_sgdrc || '/aset/logo/logo.jpg',

          // Poster dan Timeline
          poster_utama: data.poster_utama || '',
          timeline_list: data.timeline_list || '[]',

          // Dokumentasi
          link_dokumentasi: data.link_dokumentasi || '',
          foto_dokumentasi_list: data.foto_dokumentasi_list || '[]'
        }));
      }

      // Ambil Data Sponsor
      const resSponsor = await fetchPublik('/api/sponsor');
      if (resSponsor.ok) {
        const data = await resSponsor.json();
        setUmum(prev => ({ ...prev, sponsor_list: data }));
      }

      // Ambil Data Lomba Landing Page
      const resLombaLanding = await fetchPublik('/api/lomba');
      if (resLombaLanding.ok) setDaftarLombaLanding(await resLombaLanding.json());

      // Ambil Data Lomba Dashboard
      const resLombaDashboard = await fetchPublik('/api/peserta/lomba');
      if (resLombaDashboard.ok) setDaftarLombaDashboard(await resLombaDashboard.json());

      // Ambil Data Guide Book
      const resGb = await fetchPublik('/api/guidebook');
      if (resGb.ok) setDaftarGuidebook(await resGb.json());

      // Ambil Data Aksi
    } catch (error) {
      toast.error("Gagal Sinkronisasi Data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilData(true);
  }, []);

  // Fungsi Simpan Data Menu Umum
  const simpanSemuaUmum = async () => {
    setSedangMenyimpan(true);
    try {
      // Sinkronisasi Grup Wa dan Daftar Lomba
      const dataWaBulk = daftarLombaDashboard.map(l => ({
        id: l.id,
        grup_wa: l.grup_wa || ''
      }));

      // Hapus whatsapp_list
      const { whatsapp_list, ...umumTanpaWaList } = umum;

      // Kirim Data Ke API
      const res = await fetchDenganToken('/api/admin/informasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          umum: umumTanpaWaList,
          wa_bulk: dataWaBulk
        })
      });

      // Notifikasi
      if (res.ok) {
        toast.success("Perubahan Berhasil Disimpan");
        setModeEditUmum(false);
        await ambilData(false);
      } else {
        const err = await res.json();
        toast.error(err.pesan || "Gagal Menyimpan");
      }
    } catch (error) {
      console.error("Error Simpan Umum:", error);
      toast.error("Terjadi Kesalahan Sistem Saat Menyimpan");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  // Fungsi Menu Sertifikat
  const simpanSertifikat = async (dataSertifikat) => {
    setSedangMenyimpan(true);
    try {
      const res = await fetchDenganToken('/api/admin/informasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataSertifikat)
      });
      if (res.ok) {
        toast.success("Template Sertifikat Berhasil Disimpan!");
        ambilData(false);
      }
    } catch (error) {
      toast.error("Gagal menyimpan sertifikat");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  // Fungsi Upload File
  const prosesUploadFile = async (file, folder, pesanLoading = "Mengunggah...") => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const toastId = pesanLoading ? toast.loading(pesanLoading) : null;
    try {
      const res = await fetchDenganToken('/api/admin/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (toastId) toast.dismiss(toastId);
        return data.path;
      }
      if (toastId) toast.error("Gagal Mengunggah", { id: toastId });
      return null;
    } catch (error) {
      if (toastId) toast.error("Gagal Mengunggah: Terjadi kesalahan sistem", { id: toastId });
      return null;
    }
  };

  // === KELOMPOK SPONSOR ===
  // Fungsi Aksi Sponsor
  const aksiSponsor = async (aksi, dataSponsor = {}) => {
    try {
      const res = await fetchDenganToken('/api/admin/informasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsor: { ...dataSponsor, aksi } })
      });
      if (res.ok) ambilData(false);
    } catch (error) {
      toast.error("Gagal memproses sponsor");
    }
  };

  // Fungsi Upload Sponsor
  const tanganiUploadSponsor = async (id, file) => {
    const path = await prosesUploadFile(file, 'sponsor', "Mengunggah logo...");
    if (path) {
      const s = umum.sponsor_list.find(item => item.id === id);
      await aksiSponsor('update', { id, nama: s.nama, logo: path });
    }
  };

  // === KELOMPOK LOMBA ===
  // Fungsi Mengatur Halaman Lomba Landing
  const handleUpdateLombaLandingLocal = (id, field, value) => {
    setDaftarLombaLanding(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  // Fungsi Update Lomba LandingPage
  const handleUpdateLombaLandingLabelLocal = (id, labelIndex, key, value) => {
    setDaftarLombaLanding(prev => prev.map(l => {
      if (l.id === id) {
        const labelsBaru = Array.isArray(l.label) ? [...l.label] : [];
        if (!labelsBaru[labelIndex]) {
          labelsBaru[labelIndex] = { teks: '', sub: '' };
        }
        labelsBaru[labelIndex] = { ...labelsBaru[labelIndex], [key]: value };
        return { ...l, label: labelsBaru };
      }
      return l;
    }));
  };

  // Fungsi Update Lomba Dashboard
  const handleUpdateLombaDashboardLocal = (id, field, value) => {
    setDaftarLombaDashboard(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  // Fungsi Upload Lomba
  const tanganiUploadLomba = async (id, target, file) => {
    const path = await prosesUploadFile(file, 'lomba', "Mengunggah gambar...");
    if (path) {
      if (target === 'landing') {
        setDaftarLombaLanding(prev => prev.map(l => l.id === id ? { ...l, gambar: path } : l));
      } else {
        setDaftarLombaDashboard(prev => prev.map(l => l.id === id ? { ...l, gambar: path } : l));
      }
    }
  };

  // Fungsi Upload Lomba Modal
  const tanganiUploadLombaModal = async (file) => {
    const path = await prosesUploadFile(file, 'lomba', "Mengunggah gambar...");
    if (path) setLombaTerpilih(prev => ({ ...prev, gambar: path }));
  };

  // Fungsi Simpan Semua Lomba Landing
  const simpanSemuaLombaLanding = async () => {
    try {
      setSedangMenyimpan(true);
      for (const lomba of daftarLombaLanding) {
        // Filter 
        const labelsBersih = (lomba.label || []).filter(lbl => lbl && lbl.teks && lbl.teks.trim() !== '');
        await fetchDenganToken('/api/admin/informasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lomba: { aksi: 'edit', target: 'landing', ...lomba, labels: labelsBersih } })
        });
      }
      toast.success("Semua perubahan Landing Page berhasil disimpan!");
      ambilData(false);
      setModeEditLombaLanding(false);
    } catch (err) {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  // Fungsi Simpan Semua Lomba Dashboard
  const simpanSemuaLombaDashboard = async () => {
    try {
      setSedangMenyimpan(true);
      for (const lomba of daftarLombaDashboard) {
        await fetchDenganToken('/api/admin/informasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lomba: { aksi: 'edit', target: 'dashboard', ...lomba } })
        });
      }
      toast.success("Semua perubahan Dashboard berhasil disimpan!");
      ambilData(false);
      setModeEditLombaDashboard(false);
    } catch (err) {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  // Fungsi Tambah Lomba
  const tambahLomba = async (target) => {
    setSedangMenyimpan(true);
    try {
      const payload = target === 'landing'
        ? { lomba: { judul: 'Lomba Baru', deskripsi: '', gambar: '', labels: '[]', aksi: 'tambah', target: 'landing' } }
        : { lomba: { nama: 'Cabang Baru', jenjang: '', harga: '', tanggal: '', tim: '', gambar: '', status: 'Open', aksi: 'tambah', target: 'dashboard' } };

      const res = await fetchDenganToken('/api/admin/informasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (target === 'landing') setModeEditLombaLanding(true);
        else setModeEditLombaDashboard(true);
        ambilData(false);
      }
    } catch (error) {
      toast.error("Gagal menambah data");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  // Fungsi Hapus Lomba
  const hapusLomba = (id, target) => {
    const list = target === 'landing' ? daftarLombaLanding : daftarLombaDashboard;
    const item = list.find(l => l.id === id);
    setTargetLomba(target);
    setDataGbHapus({ ...item, target });
    setApakahModalHapusGbTerbuka(true);
  };

  // Fungsi Simpan Lomba
  const simpanLomba = async (lomba, aksi = 'update') => {
    try {
      const res = await fetchDenganToken('/api/admin/informasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lomba: { ...lomba, aksi, target: targetLomba } })
      });
      if (res.ok) {
        toast.success("Berhasil Disimpan");
        setApakahModalLombaTerbuka(false);
        ambilData(false);
      }
    } catch (error) {
      toast.error("Gagal memproses data lomba");
    }
  };

  // === KELOMPOK GUIDEBOOK ===
  // Fungsi Mengatur Halaman GuideBook
  const handleUpdateGuidebookLocal = (id, field, value) => {
    setDaftarGuidebook(prev => prev.map(gb => gb.id === id ? { ...gb, [field]: value } : gb));
  };

  // Fungsi Upload GuideBook
  const tanganiUploadGuidebook = async (id, file) => {
    const path = await prosesUploadFile(file, 'guidebook', "Mengunggah foto...");
    if (path) handleUpdateGuidebookLocal(id, 'foto', path);
  };

  // Fungsi Upload Guidebook Modal
  const tanganiUploadGuidebookModal = async (file) => {
    const path = await prosesUploadFile(file, 'guidebook', "Mengunggah cover...");
    if (path) setGuidebookTerpilih(prev => ({ ...prev, foto: path }));
  };

  // Fungsi Simpan Guidebook
  const simpanSemuaGuidebook = async () => {
    setSedangMenyimpan(true);
    try {
      await Promise.all(daftarGuidebook.map(gb =>
        fetchDenganToken('/api/admin/informasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guidebook: { ...gb, aksi: 'update' } })
        })
      ));
      toast.success("Semua Guidebook Berhasil Diperbarui");
      setModeEditGuidebook(false);
      ambilData(false);
    } catch (error) {
      toast.error("Gagal menyimpan perubahan Guidebook");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  // Fungsi Tambah GuideBook
  const tambahGuidebook = async () => {
    setSedangMenyimpan(true);
    try {
      const res = await fetchDenganToken('/api/admin/informasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guidebook: { judul: 'Guidebook Baru', aksi: 'tambah' } })
      });
      if (res.ok) {
        setModeEditGuidebook(true);
        ambilData(false);
      }
    } catch (error) {
      toast.error("Gagal menambah guidebook");
    } finally {
      setSedangMenyimpan(false);
    }
  };

  // Fungsi Simpan Single Guidebook
  const simpanGuidebook = async (gb, aksi = 'update') => {
    try {
      const res = await fetchDenganToken('/api/admin/informasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guidebook: { ...gb, aksi } })
      });
      if (res.ok) {
        toast.success("Guidebook berhasil diperbarui");
        setApakahModalGuidebookTerbuka(false);
        ambilData(false);
      }
    } catch (error) {
      toast.error("Gagal mengupdate guidebook");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase leading-tight">
          PUSAT INFORMASI & PENGATURAN
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-row flex-nowrap items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-full overflow-x-auto scrollbar-hide">
        {[
          { id: 'umum', nama: 'Umum', ikon: Info },
          { id: 'lomba', nama: 'Manajemen Lomba', ikon: LayoutGrid },
          { id: 'guidebook', nama: 'Guidebook', ikon: FileText },
          { id: 'jadwal', nama: 'Poster & Jadwal', ikon: Calendar },
          { id: 'template', nama: 'Template Dokumen', ikon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabAktif(tab.id)}
            className={`flex-shrink-0 flex items-center justify-start gap-1.5 lg:gap-3 px-4 lg:px-6 py-2.5 rounded-xl text-[13.5px] lg:text-[13px] xl:text-[13.8px] 2xl:text-[14.5px] font-bold tracking-normal transition-all whitespace-nowrap ${tabAktif === tab.id
              ? 'bg-[#0B255D] text-white shadow-md'
              : 'text-slate-500 hover:text-[#0B255D] hover:bg-slate-50'
              }`}
          >
            <tab.ikon className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
            {tab.nama}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#16B9FF] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Menghubungkan ke Database...</p>
          </div>
        ) : (
          <div className="relative">
            {/* Menu Umum */}
            {tabAktif === 'umum' && (
              <Umum
                umum={umum}
                setUmum={setUmum}
                modeEditUmum={modeEditUmum}
                setModeEditUmum={setModeEditUmum}
                simpanSemuaUmum={simpanSemuaUmum}
                tambahSponsor={() => aksiSponsor('tambah')}
                tanganiUploadSponsor={tanganiUploadSponsor}
                aksiSponsor={aksiSponsor}
                setTabAktif={setTabAktif}
                daftarLombaDashboard={daftarLombaDashboard}
                handleUpdateLombaDashboardLocal={handleUpdateLombaDashboardLocal}
                prosesUploadFile={prosesUploadFile}
              />
            )}

            {/* Menu Lomba */}
            {tabAktif === 'lomba' && (
              <Lomba
                daftarLombaLanding={daftarLombaLanding}
                modeEditLombaLanding={modeEditLombaLanding}
                setModeEditLombaLanding={setModeEditLombaLanding}
                daftarLombaDashboard={daftarLombaDashboard}
                modeEditLombaDashboard={modeEditLombaDashboard}
                setModeEditLombaDashboard={setModeEditLombaDashboard}
                tambahLomba={tambahLomba}
                simpanSemuaLombaLanding={simpanSemuaLombaLanding}
                simpanSemuaLombaDashboard={simpanSemuaLombaDashboard}
                handleUpdateLombaLandingLocal={handleUpdateLombaLandingLocal}
                handleUpdateLombaLandingLabelLocal={handleUpdateLombaLandingLabelLocal}
                handleUpdateLombaDashboardLocal={handleUpdateLombaDashboardLocal}
                tanganiUploadLomba={tanganiUploadLomba}
                setLombaTerpilih={setLombaTerpilih}
                setTargetLomba={setTargetLomba}
                setApakahModalLombaTerbuka={setApakahModalLombaTerbuka}
                hapusLomba={hapusLomba}
              />
            )}

            {/* Menu GuideBook */}
            {tabAktif === 'guidebook' && (
              <Guidebook
                daftarGuidebook={daftarGuidebook}
                modeEditGuidebook={modeEditGuidebook}
                setModeEditGuidebook={setModeEditGuidebook}
                tambahGuidebook={tambahGuidebook}
                simpanSemuaGuidebook={simpanSemuaGuidebook}
                handleUpdateGuidebookLocal={handleUpdateGuidebookLocal}
                tanganiUploadGuidebook={tanganiUploadGuidebook}
                setDataGbHapus={setDataGbHapus}
                setApakahModalHapusGbTerbuka={setApakahModalHapusGbTerbuka}
              />
            )}

            {/* Menu Jadwal */}
            {tabAktif === 'jadwal' && (
              <Jadwal
                data={umum}
                setUmum={setUmum}
                ambilData={ambilData}
                prosesUploadFile={prosesUploadFile}
              />
            )}

            {/* Menu Template */}
            {tabAktif === 'template' && (
              <Sertifikat
                data={umum}
                onSave={simpanSertifikat}
                sedangMenyimpan={sedangMenyimpan}
                setUmum={setUmum}
                prosesUploadFile={prosesUploadFile}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal Aksi */}
      <Aksi
        apakahModalLombaTerbuka={apakahModalLombaTerbuka}
        setApakahModalLombaTerbuka={setApakahModalLombaTerbuka}
        lombaTerpilih={lombaTerpilih}
        setLombaTerpilih={setLombaTerpilih}
        targetLomba={targetLomba}
        simpanLomba={simpanLomba}
        apakahModalGuidebookTerbuka={apakahModalGuidebookTerbuka}
        setApakahModalGuidebookTerbuka={setApakahModalGuidebookTerbuka}
        guidebookTerpilih={guidebookTerpilih}
        setGuidebookTerpilih={setGuidebookTerpilih}
        simpanGuidebook={simpanGuidebook}
        tanganiUploadLombaModal={tanganiUploadLombaModal}
        tanganiUploadGuidebookModal={tanganiUploadGuidebookModal}
        apakahModalHapusGbTerbuka={apakahModalHapusGbTerbuka}
        setApakahModalHapusGbTerbuka={setApakahModalHapusGbTerbuka}
        dataGbHapus={dataGbHapus}
        setDataGbHapus={setDataGbHapus}
        ambilData={ambilData}
      />
    </div>
  );
};

export default Informasi;
