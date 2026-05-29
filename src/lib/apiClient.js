
// Fungsi mengambil D=data
export const fetchDenganToken = async (url, opsi = {}) => {
  const token = localStorage.getItem('token_sgdrc');
  const headers = {
    ...opsi.headers,
  };

  // Tambahkan authorization header jika token tersedia
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Kirim request fetch dengan header baru
  return fetch(url, {
    ...opsi,
    headers,
  });
};

/**
 * Mengirim request GET ke API tanpa token (untuk endpoint publik)
 * @param {string} url - URL endpoint API
 * @param {Object} opsi - Opsi fetch tambahan
 * @returns {Promise<Response>} Response dari fetch
 */
export const fetchPublik = async (url, opsi = {}) => {
  return fetch(url, opsi);
};
