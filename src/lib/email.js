import nodemailer from 'nodemailer';
import { join } from 'path';

// Konfigurasi Transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'adminsgdrc@gmail.com',
    pass: 'cjrt fcqd zxlv wnca'
  }
});

// Tahun Dinamis (Real-time)
const TAHUN = new Date().getFullYear();

/**
 * 1. Fungsi untuk mengirim email Verifikasi Akun (Baru Daftar)
 */
export async function kirimEmailVerifikasi(emailTujuan, namaUser, linkVerifikasi) {
  const pesanHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; line-height: 1.6; color: #333;">
      <h2 style="color: #E40011; text-align: center;">Selamat Datang di SGDRC ${TAHUN}!</h2>
      <p>Halo <strong>${namaUser}</strong> 👋</p>
      <p>Terima kasih telah mendaftar pada <strong>Sunan Gunung Djati Robotic Competition (SGDRC) ${TAHUN}</strong> 🤖✨</p>
      <p>Untuk melanjutkan proses pendaftaran, silakan lakukan verifikasi email dengan mengklik tombol dibawah ini:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${linkVerifikasi}" style="background-color: #E40011; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">VERIFIKASI AKUN SAYA</a>
      </div>
      <p>Jika tombol tidak bisa diklik, kamu bisa gunakan link berikut:</p>
      <p style="word-break: break-all; color: #16B9FF;">${linkVerifikasi}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0 10px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"SGD Robotic Competition" <adminsgdrc@gmail.com>',
      to: emailTujuan,
      subject: `VERIFIKASI AKUN SGDRC ${TAHUN}`,
      html: pesanHtml
    });
    return true;
  } catch (error) {
    console.error("Gagal kirim email verifikasi:", error);
    return false;
  }
}

/**
 * 2. Fungsi untuk mengirim notifikasi status pendaftaran (Success/Reject/Refund)
 */
export async function kirimEmailNotifikasi(emailTujuan, namaPeserta, status, catatan, host = 'sgdrc.id', pathLampiran = null, apakahKoreksi = false) {
  const apakahBerhasil = status === 'success';
  const apakahRefund = status === 'refund';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const linkLogin = `${protocol}://${host}/login`;

  // Pindahkan logika kata-kata ke sini agar terpusat
  const infoCatatan = apakahKoreksi ? "KOREKSI BUKTI TRANSFER" : catatan;

  const subjek = apakahRefund 
    ? `PENGEMBALIAN DANA SGDRC ${TAHUN}` 
    : `INFORMASI PENDAFTARAN SGDRC ${TAHUN}`;

  const statusColor = apakahBerhasil ? '#10b981' : (apakahRefund ? '#f59e0b' : '#f43f5e');

  const headerTitle = apakahBerhasil 
    ? 'PENDAFTARAN PESERTA TERVERIFIKASI' 
    : (apakahRefund ? 'PENGEMBALIAN DANA' : 'PENDAFTARAN PESERTA DITOLAK');

  const pesanHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; line-height: 1.6; color: #333;">
      <h2 style="color: ${statusColor}; text-align: center; margin-bottom: 25px;">${headerTitle}</h2>
      
      <p>Halo <strong>${namaPeserta}</strong> 👋</p>
      
      ${apakahBerhasil ? `
        <p>Kami ingin menginformasikan bahwa pendaftaran kamu untuk <strong>Sunan Gunung Djati Robotic Competition (SGDRC) ${TAHUN}</strong> telah berhasil diverifikasi 🎉</p>
      ` : apakahRefund ? `
        <p>Kami menginformasikan bahwa pendaftaran kamu untuk <strong>SGDRC ${TAHUN}</strong> telah dibatalkan dan proses pengembalian dana telah dilakukan.</p>
      ` : `
        <p>Terima kasih sudah mendaftar pada <strong>Sunan Gunung Djati Robotic Competition (SGDRC) ${TAHUN}</strong>.</p>
        <p>Mohon maaf, setelah kami lakukan pengecekan, pendaftaran kamu belum dapat diproses lebih lanjut.</p>
      `}

      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
        <p style="margin: 0;">Status: <strong>${apakahBerhasil ? 'TERVERIFIKASI' : (apakahRefund ? 'REFUND SELESAI' : 'DITOLAK')}</strong></p>
        ${infoCatatan ? `<p style="margin: 5px 0 0 0;">Catatan: <strong>"${infoCatatan}"</strong></p>` : ''}
      </div>

      ${apakahBerhasil ? `
        <p>Selamat! Kamu sudah resmi menjadi peserta <strong>SGDRC ${TAHUN}</strong>.</p>
        <p>Silakan login ke dashboard untuk:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Melihat detail pendaftaran lomba</li>
          <li>Mengunduh bukti pendaftaran resmi</li>
          <li>Bergabung ke grup WhatsApp koordinasi</li>
        </ul>
      ` : apakahRefund ? `
        <p>Dana telah berhasil kami transfer.</p>
        <p>Sebagai konfirmasi, bukti transfer kami lampirkan pada email ini dan juga dapat kamu lihat melalui dashboard.</p>
      ` : `
        <p>Untuk saat ini, data pendaftaran tidak dapat diperbarui.</p>
        <p>Namun, kamu tetap bisa mendaftar kembali dengan membuat pendaftaran baru sesuai ketentuan yang berlaku.</p>
      `}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${linkLogin}" style="background-color: #0b255d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-block;">LOGIN KE DASHBOARD</a>
      </div>

      <p>Jika ada kendala atau membutuhkan bantuan lebih lanjut, silakan hubungi panitia.</p>

      <p style="margin-top: 30px;">${apakahRefund ? '' : `Sampai bertemu di SGDRC ${TAHUN}! 🚀<br><br>`}Salam,<br><strong>Panitia SGDRC ${TAHUN}</strong></p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0 10px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Panitia SGDRC" <adminsgdrc@gmail.com>',
      to: emailTujuan,
      subject: subjek,
      html: pesanHtml,
      attachments: (apakahRefund && pathLampiran) ? [
        {
          filename: 'Bukti_Refund.jpg',
          path: join(process.cwd(), 'public', pathLampiran)
        }
      ] : []
    });
    return true;
  } catch (error) {
    console.error("Gagal mengirim email notifikasi:", error);
    return false;
  }
}

/**
 * 3. Fungsi untuk mengirim email reset password
 */
export async function kirimEmailResetPassword(emailTujuan, namaUser, token, host = 'sgdrc.id') {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const linkReset = `${protocol}://${host}/reset-password?token=${token}`;
  
  const pesanHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; line-height: 1.6; color: #333;">
      <h2 style="color: #E40011; text-align: center; margin-bottom: 25px;">RESET PASSWORD</h2>
      
      <p>Halo <strong>${namaUser}</strong> 👋</p>
      <p>Kami menerima permintaan untuk mengatur ulang password akun SGDRC kamu.</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${linkReset}" style="background-color: #e40011; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">RESET PASSWORD</a>
      </div>

      <p style="font-size: 13px; color: #64748b; background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #cbd5e1;">
        <strong>Penting:</strong> Link ini hanya berlaku selama <strong>1 jam</strong> demi menjaga keamanan akunmu.
      </p>

      <p>Jika kamu tidak merasa melakukan permintaan, kamu bisa mengabaikan email ini. Akunmu akan tetap aman.</p>

      <p style="margin-top: 30px;">Salam,<br><strong>Panitia SGDRC ${TAHUN}</strong></p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0 10px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"IT Support SGDRC" <adminsgdrc@gmail.com>',
      to: emailTujuan,
      subject: "PERMINTAAN RESET PASSWORD AKUN SGDRC",
      html: pesanHtml
    });
    return true;
  } catch (error) {
    console.error("Gagal mengirim email reset:", error);
    return false;
  }
}
