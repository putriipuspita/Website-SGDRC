/**
 * Helper terpusat untuk Export Excel Rekap Absensi (XML Spreadsheet 2003)
 */

/* Helper Menghitung Lebar Kolom Presisi */
export const hitungLebarPresisi = (daftarTeks, minWidth = 25) => {
  const maxLen = Math.max(...daftarTeks.map(t => String(t || '').length), 0);
  return Math.max(minWidth, Math.ceil(maxLen * 5.8) + 14);
};

/* Helper Escape XML Characters */
export const escapeXml = (str) => {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/* Membersihkan Nama Sheet (Maksimal 31 Karakter) */
export const bersihkanNamaSheet = (nama) => {
  return (nama || 'Lomba')
    .replace(/[\\/?*:[\]]/g, '')
    .slice(0, 31);
};

/* Format Waktu Presensi: Cukup Jam Pake Titik Dua (Tanpa Tanggal) */
export const formatWaktuJamSaja = (waktu) => {
  if (!waktu) return '-';
  const d = new Date(waktu);
  if (isNaN(d.getTime())) return '-';
  const jam = String(d.getHours()).padStart(2, '0');
  const menit = String(d.getMinutes()).padStart(2, '0');
  const detik = String(d.getSeconds()).padStart(2, '0');
  return `${jam}:${menit}:${detik}`;
};

/* Style CSS XML Spreadsheet Excel */
export const STYLES_EXCEL_XML = `
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10"/>
    </Style>
    <Style ss:ID="HeaderTitle">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#0B255D"/>
    </Style>
    <Style ss:ID="TableHeader">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0B255D" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="CellLeft">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
      </Borders>
    </Style>
    <Style ss:ID="CellLeftBold">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0066DA"/>
    </Style>
    <Style ss:ID="CellCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
      </Borders>
    </Style>
    <Style ss:ID="StatusHadir">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#065F46"/>
      <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="StatusBelum">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#991B1B"/>
      <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
    </Style>
  </Styles>
`;

/**
 * Ekspor Rekap Presensi Absensi ke File Excel Multi-Sheet (Persis 100% Struktur Asli)
 */
export const eksporExcelAbsensi = ({ daftarAbsensi, daftarLomba, lombaPilihan }) => {
  const cabangLombaUnik = Array.from(
    new Set([
      ...daftarLomba.map(l => l.nama),
      ...daftarAbsensi.map(a => a.namaLomba)
    ])
  ).filter(Boolean);

  /* Sheet Ringkasan Statistik */
  const rekapData = cabangLombaUnik.map((lomba, idx) => {
    const items = daftarAbsensi.filter(a => a.namaLomba === lomba);
    const total = items.length;
    const hadir = items.filter(a => a.statusKehadiran === 'hadir').length;
    const belum = total - hadir;
    return { idx: idx + 1, lomba, total, hadir, belum };
  });

  const wRingkasanNo = hitungLebarPresisi(['NO', ...rekapData.map(r => r.idx)], 25);
  const wRingkasanLomba = hitungLebarPresisi(['NAMA CABANG LOMBA', ...rekapData.map(r => r.lomba)], 120);
  const wRingkasanTotal = hitungLebarPresisi(['TOTAL TERDAFTAR', ...rekapData.map(r => r.total)], 80);
  const wRingkasanHadir = hitungLebarPresisi(['SUDAH HADIR', ...rekapData.map(r => r.hadir)], 75);
  const wRingkasanBelum = hitungLebarPresisi(['BELUM HADIR', ...rekapData.map(r => r.belum)], 75);

  let sheetRingkasanXml = `
    <Worksheet ss:Name="RINGKASAN STATISTIK">
      <Table ss:ExpandedColumnCount="5">
        <Column ss:Width="${wRingkasanNo}"/>
        <Column ss:Width="${wRingkasanLomba}"/>
        <Column ss:Width="${wRingkasanTotal}"/>
        <Column ss:Width="${wRingkasanHadir}"/>
        <Column ss:Width="${wRingkasanBelum}"/>
        <Row ss:Height="24">
          <Cell ss:MergeAcross="4" ss:StyleID="HeaderTitle"><Data ss:Type="String">RINGKASAN REKAPITULASI PRESENSI EVENT SGDRC 2026</Data></Cell>
        </Row>
        <Row ss:Height="8"/>
        <Row ss:Height="22">
          <Cell ss:StyleID="TableHeader"><Data ss:Type="String">NO</Data></Cell>
          <Cell ss:StyleID="TableHeader"><Data ss:Type="String">NAMA CABANG LOMBA</Data></Cell>
          <Cell ss:StyleID="TableHeader"><Data ss:Type="String">TOTAL TERDAFTAR</Data></Cell>
          <Cell ss:StyleID="TableHeader"><Data ss:Type="String">SUDAH HADIR</Data></Cell>
          <Cell ss:StyleID="TableHeader"><Data ss:Type="String">BELUM HADIR</Data></Cell>
        </Row>
        ${rekapData.map(r => `
          <Row ss:Height="20">
            <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${r.idx}</Data></Cell>
            <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(r.lomba)}</Data></Cell>
            <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${r.total}</Data></Cell>
            <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${r.hadir}</Data></Cell>
            <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${r.belum}</Data></Cell>
          </Row>
        `).join('')}
      </Table>
      <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
        <DisplayGridlines/>
      </WorksheetOptions>
    </Worksheet>
  `;

  /* Sheet Per Cabang Lomba */
  let sheetsPerLombaXml = cabangLombaUnik.map(namaLomba => {
    const namaSheetClean = bersihkanNamaSheet(namaLomba);
    const itemsLomba = daftarAbsensi.filter(a => a.namaLomba === namaLomba);

    const wNo = hitungLebarPresisi(['NO', ...itemsLomba.map((_, i) => i + 1)], 25);
    const wId = hitungLebarPresisi(['ID REGISTRASI', ...itemsLomba.map(i => i.idPendaftaran)], 95);
    const wTim = hitungLebarPresisi(['NAMA TIM', ...itemsLomba.map(i => i.namaTim)], 75);
    const wP1 = hitungLebarPresisi(['NAMA PESERTA 1', ...itemsLomba.map(i => i.peserta1)], 90);
    const wP2 = hitungLebarPresisi(['NAMA PESERTA 2', ...itemsLomba.map(i => i.peserta2)], 90);
    const wP3 = hitungLebarPresisi(['NAMA PESERTA 3', ...itemsLomba.map(i => i.peserta3)], 90);
    const wInstansi = hitungLebarPresisi(['ASAL INSTANSI', ...itemsLomba.map(i => i.asalInstansi)], 95);
    const wStatus = hitungLebarPresisi(['STATUS KEHADIRAN', 'Sudah Hadir', 'Belum Hadir'], 95);
    const wWaktu = hitungLebarPresisi(['WAKTU PRESENSI', ...itemsLomba.map(i => formatWaktuJamSaja(i.waktuKehadiran))], 85);

    return `
      <Worksheet ss:Name="${escapeXml(namaSheetClean)}">
        <Table ss:ExpandedColumnCount="9">
          <Column ss:Width="${wNo}"/>
          <Column ss:Width="${wId}"/>
          <Column ss:Width="${wTim}"/>
          <Column ss:Width="${wP1}"/>
          <Column ss:Width="${wP2}"/>
          <Column ss:Width="${wP3}"/>
          <Column ss:Width="${wInstansi}"/>
          <Column ss:Width="${wStatus}"/>
          <Column ss:Width="${wWaktu}"/>
          <Row ss:Height="24">
            <Cell ss:MergeAcross="8" ss:StyleID="HeaderTitle"><Data ss:Type="String">DATA ABSENSI PRESENSI - ${escapeXml(namaLomba.toUpperCase())}</Data></Cell>
          </Row>
          <Row ss:Height="8"/>
          <Row ss:Height="22">
            <Cell ss:StyleID="TableHeader"><Data ss:Type="String">NO</Data></Cell>
            <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ID REGISTRASI</Data></Cell>
            <Cell ss:StyleID="TableHeader"><Data ss:Type="String">NAMA TIM</Data></Cell>
            <Cell ss:StyleID="TableHeader"><Data ss:Type="String">NAMA PESERTA 1</Data></Cell>
            <Cell ss:StyleID="TableHeader"><Data ss:Type="String">NAMA PESERTA 2</Data></Cell>
            <Cell ss:StyleID="TableHeader"><Data ss:Type="String">NAMA PESERTA 3</Data></Cell>
            <Cell ss:StyleID="TableHeader"><Data ss:Type="String">ASAL INSTANSI</Data></Cell>
            <Cell ss:StyleID="TableHeader"><Data ss:Type="String">STATUS KEHADIRAN</Data></Cell>
            <Cell ss:StyleID="TableHeader"><Data ss:Type="String">WAKTU PRESENSI</Data></Cell>
          </Row>
          ${itemsLomba.length === 0 ? `
            <Row ss:Height="20">
              <Cell ss:MergeAcross="8" ss:StyleID="CellCenter"><Data ss:Type="String">Belum ada data pendaftaran terverifikasi.</Data></Cell>
            </Row>
          ` : itemsLomba.map((item, idx) => {
            const adalahHadir = item.statusKehadiran === 'hadir';
            const waktuFormatted = formatWaktuJamSaja(item.waktuKehadiran);

            return `
              <Row ss:Height="20">
                <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(item.idPendaftaran || '-')}</Data></Cell>
                <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(item.namaTim || '-')}</Data></Cell>
                <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.peserta1 || '-')}</Data></Cell>
                <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.peserta2 || '-')}</Data></Cell>
                <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.peserta3 || '-')}</Data></Cell>
                <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.asalInstansi || '-')}</Data></Cell>
                <Cell ss:StyleID="${adalahHadir ? 'StatusHadir' : 'StatusBelum'}"><Data ss:Type="String">${adalahHadir ? 'Sudah Hadir' : 'Belum Hadir'}</Data></Cell>
                <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(waktuFormatted)}</Data></Cell>
              </Row>
            `;
          }).join('')}
        </Table>
        <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
          <DisplayGridlines/>
        </WorksheetOptions>
      </Worksheet>
    `;
  }).join('');

  /* Dokumen XML Spreadsheet Excel Lengkap */
  const excelXmlFull = `<?xml version="1.0" encoding="UTF-8"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:html="http://www.w3.org/TR/REC-html40">
      ${STYLES_EXCEL_XML}
      ${sheetRingkasanXml}
      ${sheetsPerLombaXml}
    </Workbook>
  `;

  const blob = new Blob([excelXmlFull], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const namaFileLomba = lombaPilihan === 'semua' ? 'Semua_Lomba' : lombaPilihan.replace(/[^a-zA-Z0-9]/g, '_');
  link.href = url;
  link.setAttribute('download', `Absensi_SGDRC_${namaFileLomba}_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
