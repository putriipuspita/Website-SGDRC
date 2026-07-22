'use client';
import React, { useState } from 'react';
// Import Icon
import { CheckCircle, AlertCircle, ShieldCheck, XCircle, Loader2, RotateCcw, AlertTriangle } from 'lucide-react';

// Import Komponen
import toast from 'react-hot-toast';
import ModalBase from '../../element/ModalBase';
import Konfirmasi from '../../element/Konfirmasi';

// Import Utility
import { fetchDenganToken } from '../../../lib/apiClient';

// Komponen Reusable untuk Zoom Gambar Bukti
const GambarZoom = ({ src, alt = "Gambar", className = "border-slate-200 bg-slate-50", scale = "group-hover:scale-[2]", onError }) => {
  const [zoomOrigin, setZoomOrigin] = useState('center');

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border aspect-[4/3] flex items-center justify-center cursor-zoom-in group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setZoomOrigin('center')}
    >
      <img
        src={src}
        alt={alt}
        style={{ transformOrigin: zoomOrigin }}
        className={`w-full h-full object-contain transition-transform duration-200 ease-out ${scale}`}
        onError={onError}
      />
    </div>
  );
};

// Komponen Utama Verfikasi Bukti Transfer
const Verifikasi = ({ apakahTerbuka, setApakahTerbuka, dataPeserta, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [apakahMenolak, setApakahMenolak] = useState(false);
  const [apakahProsesRefund, setApakahProsesRefund] = useState(false);
  const [apakahKonfirmasiReset, setApakahKonfirmasiReset] = useState(false);
  const [fileRefund, setFileRefund] = useState(null);
  const [previewRefund, setPreviewRefund] = useState(null);

  // Reset semua state saat modal ditutup
  React.useEffect(() => {
    if (!apakahTerbuka) {
      setCatatan('');
      setApakahMenolak(false);
      setApakahProsesRefund(false);
      setApakahKonfirmasiReset(false);
      setFileRefund(null);
      setPreviewRefund(null);
    }
  }, [apakahTerbuka]);

  if (!dataPeserta) return null;

  // Fungsi Untuk Verifikasi
  const tanganiVerifikasi = async (statusBaru) => {
    if (statusBaru === 'rejected' && !catatan) {
      toast.error("Berikan Alasan Penolakan!");
      return;
    }

    setLoading(true);

    // Kirim Data Ke Backend
    try {
      const formData = new FormData();
      formData.append('id', dataPeserta.id);
      formData.append('status', statusBaru);
      formData.append('catatan', catatan);
      if (fileRefund) formData.append('buktiRefund', fileRefund);

      // Request PATCH ke API
      const res = await fetchDenganToken('/api/admin/peserta', {
        method: 'PATCH',
        body: formData
      });

      // Cek Satus
      if (res.ok) {
        let pesan = "Status Berhasil Diperbarui";
        if (statusBaru === 'success') pesan = "Peserta Berhasil Diverifikasi!";
        if (statusBaru === 'rejected') pesan = "Pendaftaran Ditolak";
        if (statusBaru === 'refund') pesan = "Peserta Berhasil Di-Refund";

        // Tampilkan Notifikasi Sukses
        toast.success(pesan);
        if (onSuccess) onSuccess();
        setApakahTerbuka(false);

        // Reset state
        setApakahProsesRefund(false);
        setFileRefund(null);
        setPreviewRefund(null);
      }
      // Jika Gagal
      else {
        toast.error("Gagal Memperbarui Status");
      }

      // Jika Error Server
    } catch (err) {
      toast.error("Terjadi Kesalahan Sistem");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Reset Status Refund
  const tanganiResetRefund = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', dataPeserta.id);
      formData.append('resetRefund', 'true');

      // Request PATCH reset refund
      const res = await fetchDenganToken('/api/admin/peserta', {
        method: 'PATCH',
        body: formData
      });

      // Kondisi Notifikasi
      if (res.ok) {
        toast.success("Status berhasil di-reset!");
        if (onSuccess) onSuccess();
        setApakahTerbuka(false);
      } else {
        toast.error("Gagal melakukan reset");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Reset State Refund (Batal)
  const tanganiBatalRefund = () => {
    setApakahProsesRefund(false);
    setFileRefund(null);
    setPreviewRefund(null);
  };

  return (
    <>
      {/* Konfirmasi Hapus */}
      <Konfirmasi
        apakahTerbuka={apakahKonfirmasiReset}
        setApakahTerbuka={setApakahKonfirmasiReset}
        onConfirm={tanganiResetRefund}
        judulCustom="KONFIRMASI RESET STATUS"
        textTombol={loading ? "Memproses..." : "Ya, Reset"}
        iconCustom={AlertTriangle}
        pesanCustom={
          <p className="text-[11.5px] font-medium text-slate-950 leading-[1.7] px-1">
            Apakah Anda Yakin Ingin Membatalkan Refund <span className="font-bold text-red-600">"{dataPeserta?.nama}"</span>? Tindakan Ini Akan Mengembalikan Status Ke <span className="font-bold text-emerald-500">TERVERIFIKASI</span> Dan Menghapus <span className="font-bold text-orange-500">BUKTI REFUND</span> Secara Permanen.
          </p>
        }
      />

      {/* Modal Utama Verfikasi */}
      <ModalBase
        apakahTerbuka={apakahTerbuka && !apakahKonfirmasiReset}
        setApakahTerbuka={setApakahTerbuka}
        judul={dataPeserta.nama}
        subJudul={dataPeserta.lomba}
        icon={ShieldCheck}
        iconColor="text-emerald-600"
        lebar="max-w-[380px]"
        footer={
          <div className="flex gap-3 w-full">
            {dataPeserta.status === 'Refunded' && !apakahProsesRefund ? (
              // Container Tombol
              <div className="flex gap-3 w-full">
                {/* Tombol Reset Status */}
                <button
                  onClick={() => setApakahKonfirmasiReset(true)}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-wide border border-rose-100 active:scale-95 disabled:opacity-50"
                >
                  Reset Status
                </button>

                {/* Tombol Edit Bukti */}
                <button
                  onClick={() => setApakahProsesRefund(true)}
                  className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-wide border border-blue-100 active:scale-95 shadow-sm"
                >
                  Edit Bukti
                </button>
              </div>

              // Kondisi Status Refund
            ) : dataPeserta.status === 'Refunded' && apakahProsesRefund ? (
              <>
                {/* Tombol Batal */}
                <button
                  onClick={tanganiBatalRefund}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-[10px] font-black transition-all uppercase tracking-wide active:scale-95 border border-slate-300"
                >
                  Batal
                </button>

                {/* Tombol Simpan */}
                <button
                  onClick={() => tanganiVerifikasi('refund')}
                  disabled={loading || !fileRefund}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10.5px] font-black transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 uppercase tracking-wide active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Simpan"}
                </button>
              </>

              // Mode Penolakan
            ) : apakahMenolak ? (
              <>
                <button onClick={() => setApakahMenolak(false)} className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-[10px] font-black transition-all uppercase tracking-wide active:scale-95 border border-slate-300">Batal</button>
                <button onClick={() => tanganiVerifikasi('rejected')} disabled={loading} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black transition-all shadow-lg flex items-center justify-center uppercase tracking-wide active:scale-95 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Kirim Penolakan"}
                </button>
              </>

              // Mode Verifikasi
            ) : apakahProsesRefund ? (
              <>
                {/* Tombol Batal */}
                <button
                  onClick={tanganiBatalRefund}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-[10px] font-black transition-all uppercase tracking-wide active:scale-95 border border-slate-300"
                >
                  Batal
                </button>

                {/* Tombol Refund */}
                <button
                  onClick={() => tanganiVerifikasi('refund')}
                  disabled={loading || !fileRefund}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10.5px] font-black transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 uppercase tracking-wide active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Refund"}
                </button>
              </>
            ) : dataPeserta.status === 'Refunded' ? (
              <button onClick={() => setApakahTerbuka(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-wide active:scale-95 shadow-lg">Tutup</button>
            ) : (
              <>
                {/* Tombol Tolak */}
                <button onClick={() => { setApakahMenolak(true); setApakahProsesRefund(false); }} className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-tight active:scale-95 border border-rose-100 shadow-sm">
                  Tolak
                </button>

                {dataPeserta.status === 'Terverifikasi' ? (
                  /* Tombol Refund Hanya Muncul Jika Sudah Terverifikasi */
                  <button onClick={() => { setApakahProsesRefund(true); setApakahMenolak(false); }} disabled={loading} className="flex-1 py-2.5 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-tight active:scale-95 border border-orange-100 shadow-sm flex items-center justify-center">
                    Refund
                  </button>
                ) : (

                  /* Tombol Verifikasi Muncul Jika Belum Terverifikasi / Ditolak */
                  <button onClick={() => { setApakahMenolak(false); setApakahProsesRefund(false); tanganiVerifikasi('success'); }} disabled={loading} className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-tight active:scale-95 border border-emerald-100 shadow-sm flex items-center justify-center">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Verifikasi"}
                  </button>
                )}
              </>
            )}
          </div>
        }
      >
        {/* Container Isi Kontent */}
        <div className="space-y-5">
          {dataPeserta.status === 'Refunded' && !apakahProsesRefund ? (

            // Container Bukti
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              {/* Container Bukti Pembayaran */}
              <div className="space-y-2 text-left">
                {/* Label */}
                <label className="text-[10px] font-black text-slate-950 block ml-1">Bukti Pembayaran Peserta</label>

                {/* Container Gambar Bukti */}
                <GambarZoom src={dataPeserta.bukti} />
              </div>

              {/* Container Bukti Refund */}
              <div className="space-y-2 text-left">
                {/* Label */}
                <label className="text-[10px] font-black text-orange-500 block ml-1">Bukti Transfer Refund Panitia</label>

                {/* Container Gambar Refund */}
                <GambarZoom src={dataPeserta.buktiRefund} className="border-orange-100 bg-orange-50" />
              </div>
            </div>
          ) :
            // Mode Proses Refund
            apakahProsesRefund ? (
              <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                {/* Container Bukti Pembayaran */}
                <div className="space-y-2 text-left">
                  {/* Label */}
                  <label className="text-[10px] font-black text-slate-950 block ml-1">Bukti Pembayaran Peserta</label>

                  {/* Container Gambar Bukti */}
                  <GambarZoom src={dataPeserta.bukti} />
                </div>

                {/* Container Bukti Refund */}
                <div className="space-y-2 text-left">
                  {/* Label */}
                  <label className={`text-[11px] font-black block ml-1 ${dataPeserta.status === 'Refunded' ? 'text-blue-600' : 'text-orange-600'}`}>
                    {dataPeserta.status === 'Refunded' ? 'Upload Bukti Koreksi Baru' : 'Upload Bukti Transfer Refund'}
                  </label>

                  {/* Container Input File */}
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setFileRefund(file);
                          setPreviewRefund(URL.createObjectURL(file));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {/* Container Preview Bukti Refund */}
                    <div className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${previewRefund
                      ? (dataPeserta.status === 'Refunded' ? 'border-blue-500 bg-blue-50' : 'border-orange-500 bg-orange-50')
                      : 'border-slate-200 bg-slate-50'
                      }`}>
                      {previewRefund ? (
                        <img src={previewRefund} className="w-full h-40 object-contain rounded-lg" alt="Preview" />
                      ) : (
                        <>
                          <div className={`p-4 text-white rounded-full shadow-lg ${dataPeserta.status === 'Refunded' ? 'bg-blue-500 shadow-blue-200' : 'bg-orange-500 shadow-orange-200'}`}>
                            <RotateCcw size={24} />
                          </div>
                          <p className="text-[10px] font-black text-slate-950 uppercase tracking-wider">
                            {dataPeserta.status === 'Refunded' ? 'Pilih File Koreksi Baru' : 'Pilih File Bukti Transfer'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Mode Awal ( Belum Ditolak dan Belum Refund )
              <div className="space-y-2">
                {/* Label */}
                <label className="text-[11px] font-black text-slate-950 ml-1">Bukti Pembayaran</label>

                {/* Container Gambar Bukti */}
                <GambarZoom
                  src={dataPeserta.bukti || "/aset/legal/bukti.jpg"}
                  alt="Bukti"
                  scale="group-hover:scale-[2.5]"
                  onError={(e) => { e.target.src = "https://placehold.co/600x400/f8fafc/64748b?text=Gambar+Tidak+Ditemukan"; }}
                />
              </div>
            )}

          {/* Container Alasan Menolak / Proses Refund */}
          {dataPeserta.status === 'Refunded' ? null : apakahMenolak ? (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="text-[11px] font-black text-rose-600 ml-1 mb-2 block">Alasan Penolakan</label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak terbaca atau nominal kurang..."
                className="w-full p-3 bg-rose-50 border-2 border-rose-100 rounded-xl text-xs font-bold text-rose-800 outline-none focus:border-rose-300 placeholder:text-[11px] placeholder:font-normal leading-relaxed min-h-[80px]"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3 bg-amber-50/70 rounded-xl border border-amber-100/50">
              <AlertCircle className="text-amber-500 shrink-0" size={16} />
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed">Pastikan Nominal & Nama Pengirim Sudah Sesuai Sebelum Verifikasi.</p>
            </div>
          )}
        </div>
      </ModalBase>
    </>
  );
};

export default Verifikasi;
