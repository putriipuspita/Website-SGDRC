// Fungsi Format Judul
export const formatJudul = (teks) => {
  if (!teks) return "-";
  return teks
    .split(' ')
    .map(kata => kata.charAt(0).toUpperCase() + kata.slice(1).toLowerCase())
    .join(' ');
};

// Fungsi Cek Tipe Lomba
export const cekTipeLomba = (slugLomba, lombaInfo) => {
  // Jika ada data lomba dari database, tentukan berdasarkan kolom 'tim'
  if (lombaInfo && typeof lombaInfo.tim === 'string') {
    const timStr = lombaInfo.tim.toLowerCase();

    // Menentukan kapasitas
    const apakahSolo = timStr.includes('1') && !timStr.includes('2') && !timStr.includes('3') && !timStr.includes('-');
    const apakahKelompokMaks3 = timStr.includes('3');

    return { apakahSolo, apakahKelompokMaks3 };
  }

  // Fallback / Cadangan menggunakan pencocokan slug jika data DB belum dimuat
  const namaLombaRaw = slugLomba?.toLowerCase() || '';
  const apakahSolo = namaLombaRaw.includes('coding') || namaLombaRaw.includes('fast-building');
  const apakahKelompokMaks3 = namaLombaRaw.includes('junkbot') || namaLombaRaw.includes('innovative');
  return { apakahSolo, apakahKelompokMaks3 };
};
