/**
 * Utilitas format teks yang dipakai di banyak halaman
 */

/**
 * Mengubah teks menjadi huruf besar di awal setiap kata (Title Case)
 * Contoh: "ROBOT SOCCER JUNIOR" → "Robot Soccer Junior"
 * @param {string} teks - Teks yang akan diformat
 * @returns {string} Teks yang sudah diformat
 */
export const formatJudul = (teks) => {
  if (!teks) return "-";
  return teks
    .split(' ')
    .map(kata => kata.charAt(0).toUpperCase() + kata.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Menganalisis slug lomba untuk menentukan tipe (Solo vs Team, dan Junkbot)
 * @param {string} slugLomba - Slug nama lomba
 * @returns {object} { apakahSolo: boolean, apakahJunkbotInovatif: boolean }
 */
export const cekTipeLomba = (slugLomba) => {
  const namaLombaRaw = slugLomba?.toLowerCase() || '';
  const apakahSolo = namaLombaRaw.includes('coding') || namaLombaRaw.includes('fast-building');
  const apakahJunkbotInovatif = namaLombaRaw.includes('junkbot') || namaLombaRaw.includes('innovative');
  return { apakahSolo, apakahJunkbotInovatif };
};
