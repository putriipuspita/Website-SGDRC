'use client';
import React from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';

const PopUpSuksesWa = ({
  apakahTerbuka,
  setApakahTerbuka,
  status, // 'success' | 'rejected'
  namaPeserta,
  namaTim,
  namaLomba,
  whatsapp,
  catatan,
  grupWaPeserta
}) => {
  if (!apakahTerbuka) return null;

  // Bersihkan dan format nomor HP ke standar WhatsApp internasional (62)
  const formatPhoneNumber = (num) => {
    if (!num) return '';
    let cleaned = num.replace(/\D/g, ''); // Hanya ambil angka
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
  };

  const isTim = !!namaTim && namaTim.trim() !== '';
  const subjekTimPesan = isTim ? `Tim *${namaPeserta}*` : `*${namaPeserta}*`;

  // Tentukan Judul, Deskripsi Pop-Up, dan Pesan WhatsApp
  let judulModal = 'Pembaruan Berhasil';
  let deskripsiModal = null;
  let textMsg = '';

  if (status === 'success') {
    judulModal = 'Verifikasi Berhasil';
    deskripsiModal = (
      <>
        Pendaftaran untuk <span className="font-bold text-emerald-600">"{namaPeserta}"</span> telah berhasil diverifikasi. Silakan kirimkan notifikasi resmi ke WhatsApp peserta.
      </>
    );
    textMsg = `Halo, *${namaPeserta}* 👋\n\nSelamat! Pendaftaran ${subjekTimPesan} pada *Sunan Gunung Djati Robotic Competition (SGDRC) 2026* telah *berhasil diverifikasi* oleh panitia. 🎉\n\nSilakan bergabung ke *Grup Umum Peserta SGDRC 2026* melalui tautan berikut agar seluruh informasi dan pengumuman selama pelaksanaan kompetisi tidak terlewat.\n\n🔗 ${grupWaPeserta || ''}\n\nSelanjutnya, silakan login ke *Dashboard Website SGDRC* untuk:\n\n* 📄 Mengunduh *Bukti Pendaftaran Resmi*.\n* 📱 Mengunduh *QR Code Absensi* (Wajib ditunjukkan saat registrasi di lokasi event).\n* 👥 Bergabung ke *Grup WhatsApp sesuai cabang perlombaan* yang diikuti.\n\nTerima kasih telah menjadi bagian dari *SGDRC 2026*.\n\nSampai jumpa di arena kompetisi! 🚀\n\n—\n*Panitia Sunan Gunung Djati Robotic Competition (SGDRC) 2026*`;
  } else if (status === 'rejected') {
    judulModal = 'Pendaftaran Ditolak';
    deskripsiModal = (
      <>
        Pendaftaran untuk <span className="font-bold text-rose-600">"{namaPeserta}"</span> telah ditolak dengan catatan: <span className="font-bold">"{catatan || 'Harap periksa kembali berkas pendaftaran Anda.'}"</span>. Silakan kirimkan pemberitahuan resmi ke WhatsApp peserta.
      </>
    );
    textMsg = `Halo, *${namaPeserta}* 👋\n\nTerima kasih telah mendaftar pada *Sunan Gunung Djati Robotic Competition (SGDRC) 2026*.\n\nMohon maaf, pendaftaran ${subjekTimPesan} belum dapat kami terima karena:\n\n*${catatan || 'Harap periksa kembali berkas pendaftaran Anda.'}*\n\nApabila terdapat pertanyaan atau kendala terkait proses pendaftaran, silakan menghubungi panitia.\n\nTerima kasih.\n\n—\n*Panitia Sunan Gunung Djati Robotic Competition (SGDRC) 2026*`;
  }

  const waUrl = `https://api.whatsapp.com/send?phone=${formatPhoneNumber(whatsapp)}&text=${encodeURIComponent(textMsg)}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 transition-opacity" onClick={() => setApakahTerbuka(false)}></div>

      {/* Modal Box */}
      <div className="w-full max-w-[340px] bg-white rounded-[28px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] border border-slate-200 relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden font-montserrat p-7 text-center flex flex-col items-center">
        {/* Ikon Sukses */}
        <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 relative">
          <CheckCircle size={28} />
        </div>

        {/* Title */}
        <h3 className="text-[15.7px] font-black text-slate-800 uppercase tracking-wide mb-3">
          {judulModal}
        </h3>

        {/* Description */}
        <p className="text-[11.7px] font-medium text-slate-950 leading-[1.7] px-1 mb-6">
          {deskripsiModal}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setApakahTerbuka(false)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10.7px] font-black transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 uppercase tracking-wide active:scale-95 text-center"
          >
            Kirim Notifikasi WhatsApp
          </a>
          <button
            onClick={() => setApakahTerbuka(false)}
            className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-950 rounded-xl text-[10.7px] font-bold transition-all uppercase tracking-wide border border-slate-300 text-center"
          >
            Tutup & Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUpSuksesWa;
