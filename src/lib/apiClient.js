/**
 * Pembungkus API fetch yang otomatis menyematkan token JWT
 * Menghapus duplikasi kode pengambilan token manual di seluruh komponen
 */

/**
 * Mengirim request HTTP ke API dengan token otomatis
 * @param {string} url - URL endpoint API
 * @param {Object} opsi - Opsi fetch tambahan (method, body, dll)
 * @returns {Promise<Response>} Response dari fetch
 */
export const fetchDenganToken = async (url, opsi = {}) => {
  const token = localStorage.getItem('token_sgdrc');
  const headers = {
    ...opsi.headers,
  };

  // Tambahkan Authorization header jika token tersedia
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
