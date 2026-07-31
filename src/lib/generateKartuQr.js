/**
 * Helper terpusat untuk membuat Kartu QR Code Absensi Digital SGDRC
 * Digunakan baik di Frontend (Download PNG) maupun Backend (Email Attachment)
 */

export function dapatkanDataKartuQr(data) {
  const idStr = String(data.idPendaftaran || data.id_pendaftaran || data.id || '');
  const regIdFormatted = idStr.startsWith('REG-')
    ? idStr
    : `REG-SGDRC-2026-${String(idStr).padStart(4, '0')}`;
  
  const namaSubjek = (data.tim && data.tim.trim() !== '') 
    ? data.tim 
    : (data.peserta && data.peserta[0] ? data.peserta[0] : (data.nama_peserta1 || 'PESERTA'));
  
  const lombaTeks = (data.lomba || data.nama_lomba || '').toUpperCase();
  const instansiTeks = (data.instansi || '').toUpperCase();

  return {
    regIdFormatted,
    namaSubjek: namaSubjek.toUpperCase(),
    lombaTeks,
    instansiTeks
  };
}

/**
 * Menghasilkan string SVG Kartu QR Absensi berframe persis desain website
 */
export function generateKartuQrSvg({ regIdFormatted, namaSubjek, lombaTeks, instansiTeks, qrDataUri }) {
  const subtitleInfo = [lombaTeks, instansiTeks].filter(Boolean).join(' • ');
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="730" viewBox="0 0 600 730">
    <style>
      .bg { fill: #FFFFFF; }
      .border-outer { fill: none; stroke: #E2E8F0; stroke-width: 4; }
      .header-bg { fill: #E40011; }
      .header-title { fill: #FFFFFF; font-family: system-ui, -apple-system, sans-serif; font-weight: bold; font-size: 20px; text-anchor: middle; }
      .header-subtitle { fill: #FFE4E6; font-family: system-ui, -apple-system, sans-serif; font-weight: bold; font-size: 13px; text-anchor: middle; }
      .subject-name { fill: #0F172A; font-family: system-ui, -apple-system, sans-serif; font-weight: bold; font-size: 28px; text-anchor: middle; }
      .subtitle-info { fill: #16B9FF; font-family: system-ui, -apple-system, sans-serif; font-weight: bold; font-size: 15px; text-anchor: middle; }
      .divider { stroke: #CBD5E1; stroke-width: 1; }
      .qr-bg { fill: #F8FAFC; stroke: #E2E8F0; stroke-width: 2; }
      .reg-id { fill: #0F172A; font-family: monospace; font-weight: bold; font-size: 18px; text-anchor: middle; }
      .footer-text { fill: #000000; font-family: system-ui, -apple-system, sans-serif; font-style: italic; font-weight: bold; font-size: 13px; text-anchor: middle; }
    </style>

    <!-- Background & Border Luar -->
    <rect width="600" height="730" class="bg" />
    <rect x="10" y="10" width="580" height="710" class="border-outer" />

    <!-- Header Banner -->
    <rect x="10" y="10" width="580" height="100" class="header-bg" />
    <text x="300" y="48" class="header-title">SUNAN GUNUNG DJATI ROBOTICS COMPETITION</text>
    <text x="300" y="75" class="header-subtitle">Kartu Absensi Digital Peserta (SGDRC 2026)</text>

    <!-- Nama Subjek & Detail Lomba -->
    <text x="300" y="155" class="subject-name">${escapeXml(namaSubjek)}</text>
    <text x="300" y="188" class="subtitle-info">${escapeXml(subtitleInfo)}</text>
    <line x1="40" y1="208" x2="560" y2="208" class="divider" />

    <!-- Bingkai & Image QR Code -->
    <rect x="115" y="213" width="370" height="370" class="qr-bg" />
    <image x="130" y="228" width="340" height="340" href="${qrDataUri}" />

    <!-- ID Registrasi -->
    <text x="300" y="618" class="reg-id">${escapeXml(regIdFormatted)}</text>

    <!-- Footer Petunjuk -->
    <text x="300" y="668" class="footer-text">Harap tunjukan QR ini kepada panitia pada saat registrasi.</text>
  </svg>`;
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
