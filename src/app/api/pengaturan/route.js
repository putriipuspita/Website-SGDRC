import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await hubungkanDB();
    const [baris] = await db.query('SELECT * FROM pengaturan');
    
    // Logika Self-Healing: Jika kunci belum ada atau nilainya NULL/kosong, isi dengan default
    const keysPenting = {
      deskripsi_hero: '“Beyond Competition : With Small Action, Make Your Creation Become A Champion”',
      tanggal_event: '2026-08-15 08:00:00',
      bank_nama: 'Bank BSI (Bank Syariah Indonesia)',
      bank_rekening: '1234567890',
      bank_atas_nama: 'SGD RC 2026',
      wa_link_umum: 'https://wa.me/628123456789',
      ketua_pelaksana: 'Sarah Nurul Yakin',
      path_ttd: '/aset/legal/ttd putra.png',
      path_cap: '/aset/legal/cap sgdrc.png',
      path_logo_robotika: '/aset/logo/robotika.png',
      path_logo_sgdrc: '/aset/logo/logo.jpg'
    };

    const pengaturan = { ...keysPenting };

    // Proses data dari DB
    baris.forEach(item => {
      if (item.nilai) {
        pengaturan[item.nama_key] = item.nilai;
      }
    });

    // Perbarui DB jika ada yang kosong/NULL
    for (const [key, nilai] of Object.entries(keysPenting)) {
      const dataDB = baris.find(item => item.nama_key === key);
      
      if (!dataDB) {
        // Jika belum ada barisnya sama sekali
        await db.query('INSERT INTO pengaturan (nama_key, nilai) VALUES (?, ?)', [key, nilai]);
      } else if (!dataDB.nilai || dataDB.nilai === 'NULL' || dataDB.nilai === '') {
        // Jika barisnya ada tapi nilainya NULL atau kosong (seperti di screenshot)
        await db.query('UPDATE pengaturan SET nilai = ? WHERE nama_key = ?', [nilai, key]);
      }
    }

    // Fallback Sponsor Lama
    if (!pengaturan.sponsor_list) {
      const [sponsors] = await db.query('SELECT * FROM sponsor');
      if (sponsors.length > 0) {
        const list = sponsors.map(s => ({
          nama: s.nama || s.judul || '',
          logo: s.gambarLogo || s.gambar || ''
        }));
        pengaturan.sponsor_list = JSON.stringify(list);
      }
    }

    return NextResponse.json(pengaturan);
  } catch (error) {
    console.error('Error Database:', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = await hubungkanDB();

    // Update setiap key yang dikirim
    for (const [key, nilai] of Object.entries(data)) {
      const [cek] = await db.query('SELECT nama_key FROM pengaturan WHERE nama_key = ?', [key]);
      if (cek.length > 0) {
        await db.query('UPDATE pengaturan SET nilai = ? WHERE nama_key = ?', [nilai, key]);
      } else {
        await db.query('INSERT INTO pengaturan (nama_key, nilai) VALUES (?, ?)', [key, nilai]);
      }
    }

    return NextResponse.json({ pesan: 'Berhasil diperbarui' });
  } catch (error) {
    console.error('Error Save:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}
