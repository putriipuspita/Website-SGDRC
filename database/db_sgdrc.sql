
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ===================================================
--                TABEL PENGATURAN
-- ===================================================
CREATE TABLE `pengaturan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_key` varchar(50) NOT NULL,
  `nilai` text NOT NULL,
  `deskripsi` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `pengaturan` (`id`, `nama_key`, `nilai`, `deskripsi`) VALUES
-- Umum
(1, 'judul_hero', 'SGDRC 2026', NULL),
(2, 'deskripsi_hero', '“Sustainable Robotics Systems: Towards a Shared Future”', 'Slogan di bawah judul utama'),
(3, 'tanggal_event', '2026-06-30 08:00:00', 'Target hitung mundur'),
(4, 'wa_link_umum', 'https://wa.me/6289653263531', NULL),

-- Rekening Bank
(5, 'bank_nama', 'Bank BSI (Bank Syariah Indonesia)', NULL),
(6, 'bank_rekening', '1234567890', NULL),
(7, 'bank_atas_nama', 'SGD RC 2026', NULL),

-- Legalitas
(8, 'ketua_pelaksana', 'Nur Hidayat Saputra', NULL),
(9, 'ketua_nim', '12345678910', NULL),
(10, 'path_ttd', '/aset/legal/ttd putra.webp', NULL),
(11, 'path_cap', '/aset/legal/cap sgdrc.webp', NULL),
(12, 'path_logo_robotika', '/aset/logo/robotika.webp', NULL),
(13, 'path_logo_sgdrc', '/aset/logo/logo.webp', NULL),

-- Sertifikat
(14, 'sertifikat_peserta', '/aset/legal/peserta.webp', NULL),
(15, 'sertifikat_juara', '/aset/legal/juara.webp', NULL),
(16, 'sertifikat_nomor_mulai', '0001', NULL),
(17, 'sertifikat_nomor_mulai_juara', '0001', NULL),
(18, 'sertifikat_format_nomor', '[no]/B/SPH/PAN-SGDRC/BSORobotika.UIN-SGD-BDG/XI/2026', NULL),
(19, 'sertifikat_config_peserta', '{"y_nomor":33,"y_nama":43,"y_status":50,"y_kategori":72,"size_nomor":12,"size_nama":31,"size_status":15,"size_kategori":13,"font_nama":"Cormorant Garamond"}', NULL),
(20, 'sertifikat_config_juara', '{"y_nomor":29,"y_nama":37,"y_status":51,"y_kategori":57,"size_nomor":10,"size_nama":28,"size_status":16,"size_kategori":13,"font_nama":"UnifrakturMaguntia"}', NULL),

-- Poster dan Sponsor
(21, 'poster_utama', '/aset/logo/poster.webp', NULL),
(22, 'sponsor_list', '[{"id":5,"nama":"Lee Mineralle","logo":"/aset/sponsor/lee mineralle.webp"},{"id":4,"nama":"Telkom Indonesia","logo":"/aset/sponsor/telkom.webp"},{"id":3,"nama":"BNI","logo":"/aset/sponsor/bni.webp"},{"id":2,"nama":"CNC","logo":"/aset/sponsor/cnc.webp"},{"id":1,"nama":"BSI","logo":"/aset/sponsor/bsi.webp"}]', NULL),
(23, 'timeline_list', '[{"id":1,"label":"Pendaftaran Batch 1","tanggal":"1 - 23 Mei 2026","status":"Selesai","mulai":"2026-05-01","selesai":"2026-05-23"},{"id":2,"label":"Pendaftaran Batch 2","tanggal":"24 Mei - 11 Juni 2026","status":"Sedang Berlangsung","mulai":"2026-05-24","selesai":"2026-06-11"},{"id":3,"label":"Pengumpulan Proposal (Project Innovative)","tanggal":"1 - 11 Juni 2026","status":"Akan Datang","mulai":"2026-06-01","selesai":"2026-06-11"},{"id":4,"label":"Pengumuman Proposal","tanggal":"17 Juni 2026","status":"Akan Datang","mulai":"2026-06-17","selesai":"2026-06-17"},{"id":5,"label":"Technical Meeting","tanggal":"27 Juni 2026","status":"Akan Datang","mulai":"2026-06-27","selesai":"2026-06-27"},{"id":6,"label":"Pelaksanaan Lomba (Robot Soccer, Fast Building, Junkbot)","tanggal":"4 Juli 2026","status":"Akan Datang","mulai":"2026-07-04","selesai":"2026-07-04"},{"id":1778740157309,"label":"Pelaksanaan Lomba (Project Innovative)","tanggal":"5 Juli 2026","status":"Akan Datang","mulai":"2026-07-05","selesai":"2026-07-05"}]', NULL);

-- ===================================================
--              TABEL LOMBA LANDING PAGE
-- ===================================================
CREATE TABLE `lomba_landing_page` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `judul` varchar(100) NOT NULL,
  `deskripsi` text NOT NULL,
  `gambar` varchar(255) NOT NULL,
  `labels` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `lomba_landing_page` (`id`, `judul`, `deskripsi`, `gambar`, `labels`) VALUES
(1, 'ROBOT SOCCER', 'Kompetisi sepak bola antar robot dalam tim (2 peserta) untuk mencetak gol sebanyak mungkin.', '/aset/lomba/soccer.webp', '[{"teks":"Junior","sub":"(SD)"},{"teks":"Senior","sub":"(SMP & SMA)"}]'),
(2, 'FAST BUILDING', 'Kompetisi merakit project dalam waktu terbatas untuk menguji kecepatan dan ketepatan.', '/aset/lomba/fast building.webp', '[{"teks":"Junior","sub":"(Maks 7 Tahun)"},{"teks":"Senior","sub":"(Maks 9 Tahun)"}]'),
(3, 'WEDO 2.0', 'Kompetisi merakit dan memprogram robot berdasarkan instruksi yang diberikan dalam waktu tertentu.', '/aset/lomba/wedo.webp', '[{"teks":"3 SD - 6 SD","sub":""}]'),
(4, 'PROJECT INNOVATIVE', 'Kompetisi menciptakan atau mengembangkan inovasi teknologi dalam menjawab permasalahan', '/aset/lomba/project innovative.webp', '[{"teks":"SMP - SMA","sub":""}]'),
(5, 'LINE FOLLOWER', 'Kompetisi untuk menguji kemampuan robot agar dapat mengikuti lintasan secara otomatis.', '/aset/lomba/line follower.webp', '[{"teks":"Junior","sub":"SD - SMP"},{"teks":"Senior","sub":"SMA - Mahasiswa"}]'),
(6, 'TRANSPORTER', 'Kompetisi memindahkan objek ke zona tujuan menggunakan robot secara cepat dan akurat.', '/aset/lomba/transporter.webp', '[{"teks":"Mahasiswa","sub":""}]');

-- ===================================================
--             TABEL LOMBA DASHBOARD
-- ===================================================
CREATE TABLE `lomba_dashboard` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `jenjang` varchar(100) NOT NULL,
  `harga` varchar(50) NOT NULL,
  `tanggal` varchar(50) NOT NULL,
  `tim` varchar(50) NOT NULL,
  `gambar` varchar(255) NOT NULL,
  `status` enum('Open','Close') DEFAULT 'Open',
  `grup_wa` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `lomba_dashboard` (`id`, `nama`, `jenjang`, `harga`, `tanggal`, `tim`, `gambar`, `status`, `grup_wa`) VALUES
(1, 'ROBOT SOCCER JUNIOR', 'SD / MI', 'Rp. 250.000', '01 November 2026', '2 Orang', '/aset/lomba/soccer.webp', 'Open', 'https://chat.whatsapp.com/Ci2u6pcBI6l7kUITChkPC6'),
(2, 'ROBOT SOCCER SENIOR', 'SMP/MTS - SMA/K/MA', 'Rp. 250.000', '01 November 2026', '2 Orang', '/aset/lomba/soccer.webp', 'Open', 'https://chat.whatsapp.com/Ci2u6pcBI6l7kUITChkPC6'),
(3, 'FAST BUILDING JUNIOR', 'Maks 7 Tahun', 'Rp. 175.000', '01 November 2026', '1 Orang', '/aset/lomba/lego.png', 'Open', 'https://chat.whatsapp.com/Ci2u6pcBI6l7kUITChkPC6'),
(4, 'FAST BUILDING SENIOR', 'Maks 9 Tahun', 'Rp. 175.000', '01 November 2026', '1 Orang', '/aset/lomba/fast building.webp', 'Open', 'https://chat.whatsapp.com/Ci2u6pcBI6l7kUITChkPC6'),
(5, 'WEDO 2.0', '3 SD - 6 SD', 'Rp. 175.000', '01 November 2026', '1 Orang', '/aset/lomba/wedo.webp', 'Open', 'https://chat.whatsapp.com/Ci2u6pcBI6l7kUITChkPC6'),
(6, 'PROJECT INNOVATIVE', 'SMP/MTS - SMA/K/MA', 'Rp. 200.000', '02 November 2026', '1 - 3 Orang', '/aset/lomba/project innovative.webp', 'Open', 'https://chat.whatsapp.com/Ci2u6pcBI6l7kUITChkPC6'),
(7, 'LINE FOLLOWER JUNIOR', 'SD/MI - SMP/MTS', 'Rp. 150.000', '01 November 2026', '2 Orang', '/aset/lomba/line follower.webp', 'Open', 'https://chat.whatsapp.com/Ci2u6pcBI6l7kUITChkPC6'),
(8, 'LINE FOLLOWER SENIOR', 'SMA/K/MA- Mahasiswa', 'Rp. 150.000', '01 November 2026', '2 Orang', '/aset/lomba/line follower.webp', 'Open', 'https://chat.whatsapp.com/Ci2u6pcBI6l7kUITChkPC6'),
(9, 'TRANSPORTER', 'Mahasiswa', 'Rp. 150.000', '02 November 2026', '2 Orang', '/aset/lomba/transporter.webp', 'Open', 'https://chat.whatsapp.com/Ci2u6pcBI6l7kUITChkPC6');

-- ===================================================
--                 TABEL SPONSOR
-- ===================================================
CREATE TABLE `sponsor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `gambarLogo` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `sponsor` (`id`, `nama`, `gambarLogo`) VALUES
(1, 'BSI', '/aset/sponsor/bsi.webp'),
(2, 'CNC', '/aset/sponsor/cnc.webp'),
(3, 'BNI', '/aset/sponsor/bni.webp'),
(4, 'Telkom Indonesia', '/aset/sponsor/telkom.webp'),
(5, 'Lee Mineralle', '/aset/sponsor/lee mineralle.webp');

-- ===================================================
--                 TABEL GUIDEBOOK
-- ===================================================
CREATE TABLE `guidebook` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `judul` varchar(100) NOT NULL,
  `deskripsi` text NOT NULL,
  `foto` varchar(255) NOT NULL,
  `tautan` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `guidebook` (`id`, `judul`, `deskripsi`, `foto`, `tautan`) VALUES
(13, 'Robot Soccer', 'Robot Soccer merupakan ajang kompetisi robotika yang menguji kemampuan strategi dan keahlian teknis peserta melalui permainan sepak bola antar robot dalam tim yang terdiri dari dua peserta dengan tujuan mencetak gol sebanyak mungkin.', '/aset/lomba/soccer.webp', 'https://drive.google.com/file/d/1A-3yzN5FhLpwKuQqpbYW40QK0H9aomTi/view?usp=drive_link'),
(14, 'Fast Building', 'Fast Building adalah kompetisi yang menantang peserta untuk membangun dan merakit sebuah proyek dalam waktu terbatas dengan kreativitas, kecepatan, dan ketepatan. Peserta berlomba merakit kit robotik atau LEGO ke bentuk yang telah ditentukan.', '/aset/lomba/fast building.webp', 'https://drive.google.com/file/d/1WNvOGMSx6gZ6RC3eRIXrOd5hO1dE_V28/view?usp=drive_link'),
(15, 'WeDo 2.0', 'WeDo 2.0 merupakan kompetisi robotika yang menguji kemampuan peserta dalam merancang dan memprogram robot LEGO berdasarkan soal yang diberikan. Kompetisi ini menilai logika pemrograman, dan ketepatan dalam menyelesaikan tantangan.', '/aset/lomba/wedo.webp', 'https://drive.google.com/file/d/1WNvOGMSx6gZ6RC3eRIXrOd5hO1dE_V28/view?usp=drive_link'),
(16, 'Project Innovative', 'Project Innovative merupakan kompetisi yang menantang tim untuk menciptakan dan mengembangkan inovasi teknologi melalui perancangan suatu produk berbasis teknologi yang memiliki nilai guna serta mampu menjawab permasalahan nyata.', '/aset/lomba/project innovative.webp', 'https://drive.google.com/open?id=1pBCmbStWvFX0fe3ZDWjYS31x1P1VU2tw&usp=drive_copy'),
(17, 'Line Follower', 'Line Follower merupakan kompetisi robotika yang menguji kemampuan robot dalam mengikuti jalur secara otomatis. Kompetisi ini menilai kemampuan teknis, ketepatan algoritma pemrograman, serta respons robot dalam mengikuti lintasan.', '/aset/lomba/line follower.webp', 'https://drive.google.com/file/d/12hOOTRidmcUMKh_G_tvGhB_t7b-3hNgD/view?usp=drive_link'),
(18, 'Transporter', 'Transporter merupakan kompetisi robotika yang menguji kemampuan peserta dalam mengendalikan robot untuk memindahkan objek dari satu titik ke zona tujuan secara cepat, tepat, dan stabil sesuai ketentuan perlombaan dalam waktu yang terbatas.', '/aset/lomba/transporter.webp', 'https://drive.google.com/file/d/12hOOTRidmcUMKh_G_tvGhB_t7b-3hNgD/view?usp=drive_link');

-- ===================================================
--                 TABEL USER
-- ===================================================
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','peserta') DEFAULT 'peserta',
  `status_verifikasi` tinyint(1) DEFAULT 0,
  `token_verifikasi` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `tanggal_daftar` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `status_verifikasi`) VALUES
(1, 'Admin SGDRC', 'adminsgdrc@gmail.com', '$2b$10$WFTUJdLnIkjTzXFqxZWC8.IhxEaEQz/WSB9nqO7EnujV.6q8WDyZ2', 'admin', 1);

-- ===================================================
--                 TABEL PENDAFTARAN
-- ===================================================
CREATE TABLE `pendaftaran` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `lomba_id` int(11) NOT NULL,
  `nama_tim` varchar(100) DEFAULT NULL,
  `nama_peserta1` varchar(100) NOT NULL,
  `nama_peserta2` varchar(100) DEFAULT NULL,
  `nama_peserta3` varchar(100) DEFAULT NULL,
  `asal_instansi` varchar(100) NOT NULL,
  `jenjang` varchar(50) NOT NULL,
  `whatsapp` varchar(20) NOT NULL,
  `file_kartu_siswa` varchar(255) DEFAULT NULL,
  `file_follow_ig` varchar(255) DEFAULT NULL,
  `file_follow_ig_robotika` varchar(255) DEFAULT NULL,
  `file_follow_tiktok` varchar(255) DEFAULT NULL,
  `file_bukti_bayar` varchar(255) DEFAULT NULL,
  `file_bukti_refund` varchar(255) DEFAULT NULL,  
  `status_pendaftaran` enum('pending','success','rejected','refund') DEFAULT 'pending',
  `catatan_admin` text DEFAULT NULL,
  `peringkat` varchar(50) DEFAULT NULL,
  `is_sertifikat_siap` tinyint(1) DEFAULT 0,
  `tanggal_pendaftaran` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
