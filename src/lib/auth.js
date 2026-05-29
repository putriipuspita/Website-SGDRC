import jwt from 'jsonwebtoken';
import { hubungkanDB } from './db';

export const SECRET_KEY = 'sgdrc-rahasia-banget';

// Helper verifikasi Admin
export async function verifikasiAdmin(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return { error: new Response(JSON.stringify({ pesan: "Sesi habis, silakan login ulang" }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return { error: new Response(JSON.stringify({ pesan: "Token tidak valid" }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }

  const db = await hubungkanDB();
  const [user] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
  if (user.length === 0 || user[0].role !== 'admin') {
    return { error: new Response(JSON.stringify({ pesan: "Akses ditolak" }), { status: 403, headers: { 'Content-Type': 'application/json' } }) };
  }

  return { decoded, db };
}

// Helper verifikasi User (Peserta biasa)
export async function verifikasiUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return { error: new Response(JSON.stringify({ pesan: "Sesi Berakhir" }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return { error: new Response(JSON.stringify({ pesan: "Token tidak valid" }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }

  const db = await hubungkanDB();
  return { decoded, db };
}

// Helper simpan file upload
export async function simpanBerkasUpload(file, prefix = 'file') {
  if (!file || typeof file === 'string') return null;
  try {
    const { writeFile, mkdir } = await import('fs/promises');
    const { join, dirname } = await import('path');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${prefix}-${file.name.replace(/\s+/g, '_')}`;
    const relativePath = `/uploads/pendaftaran/${fileName}`;
    const fullPath = join(process.cwd(), 'public', relativePath);
    
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);
    return relativePath;
  } catch (err) {
    console.error("Gagal simpan file:", err);
    return null;
  }
}
