import { hubungkanDB } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET_KEY = 'sgdrc-rahasia-banget';

// Endpoint GET statistik dashboard admin
export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');

    // Validasi apakah token tersedia
    if (!authHeader) {
      return new Response(JSON.stringify({ pesan: "Sesi habis" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validasi token JWT
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return new Response(JSON.stringify({ pesan: "Token tidak valid" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validasi role admin
    if (decoded.role !== 'admin') {
      return new Response(JSON.stringify({ pesan: "Akses ditolak" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ambil data peserta dari database
    const db = await hubungkanDB();
    const [users] = await db.query(`
      SELECT id, nama, email 
      FROM users 
      WHERE role = 'peserta' AND status_verifikasi = 1 
      ORDER BY id DESC
    `);

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ pesan: "Terjadi kesalahan server" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ pesan: "Token tidak ditemukan" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return new Response(JSON.stringify({ pesan: "Token tidak valid" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (decoded.role !== 'admin') {
      return new Response(JSON.stringify({ pesan: "Akses ditolak" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { nama, email, password } = body;

    if (!nama || !email || !password) {
      return new Response(JSON.stringify({ pesan: "Semua data wajib diisi" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = await hubungkanDB();
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return new Response(JSON.stringify({ pesan: "Email sudah terdaftar" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (nama, email, password, role, status_verifikasi) VALUES (?, ?, ?, 'peserta', 1)",
      [nama, email, hashedPassword]
    );

    return new Response(JSON.stringify({ pesan: "Akun berhasil dibuat" }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ pesan: "Gagal membuat akun" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ pesan: "Token tidak ditemukan" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return new Response(JSON.stringify({ pesan: "Token tidak valid" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (decoded.role !== 'admin') {
      return new Response(JSON.stringify({ pesan: "Akses ditolak" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = await req.json();
    const db = await hubungkanDB();
    if (id === decoded.id) {
      return new Response(JSON.stringify({ pesan: "Tidak bisa menghapus akun sendiri" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hapus juga data pendaftaran yang terkait agar tidak jadi data "hantu"
    await db.query("DELETE FROM pendaftaran WHERE user_id = ?", [id]);
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    return new Response(JSON.stringify({ pesan: "User berhasil dihapus" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ pesan: "Gagal menghapus user" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
