'use client';
import React from 'react';

// Import Icon
import {
  LayoutGrid, Plus, Save, Settings, Upload, Trash2, Users
} from 'lucide-react';

// Komponen Input Sel Tabel Lomba (Menghindari Pengulangan Kode TD)
const InputCell = ({ isEdit, value, onChange, placeholder = "", classNameText = "text-slate-500 uppercase" }) => {
  return (
    <td className="px-3 py-3 border-r border-slate-200 text-center">
      {isEdit ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11.5px] font-medium text-center outline-none"
        />
      ) : (
        <span className={`text-[11.5px] font-medium tracking-tight ${classNameText}`}>{value || "-"}</span>
      )}
    </td>
  );
};

// Komponen Section untuk Wrapper Card dan Header Lomba
const LombaSection = ({ title, Icon, type, modeEdit, setModeEdit, onSave, onAdd, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Container Header */}
      <div className="h-[55px] px-6 bg-[#0B255D] flex items-center justify-between">
        {/* Judul dan Icon */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Icon className="text-white" size={16} />
          </div>
          <h2 className="text-white font-bold text-[13px] uppercase tracking-wide">{title}</h2>
        </div>

        {/* Container Aksi */}
        <div className="flex items-center gap-3">
          {/* Tombol Tambah */}
          <button
            onClick={() => onAdd(type)}
            className="bg-white text-[#0B255D] hover:bg-slate-50 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={14} /> {type === 'landing' ? 'Tambah Card' : 'Tambah Cabang'}
          </button>

          {/* Tombol Simpan dan Edit */}
          <button
            onClick={() => {
              if (modeEdit) onSave();
              setModeEdit(!modeEdit);
            }}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 shadow-sm ${modeEdit ? 'bg-emerald-500 text-white' : 'bg-white text-[#0B255D] hover:bg-slate-50'
              }`}
          >
            {modeEdit ? <><Save size={14} /> Simpan Semua</> : <><Settings size={14} /> Edit Tabel</>}
          </button>
        </div>
      </div>

      {/* Container Tabel */}
      <div className="overflow-x-auto border-t border-slate-100">
        {children}
      </div>
    </div>
  );
};

// Komponen Utama Lomba
const Lomba = ({
  daftarLombaLanding,
  modeEditLombaLanding,
  setModeEditLombaLanding,
  daftarLombaDashboard,
  modeEditLombaDashboard,
  setModeEditLombaDashboard,
  tambahLomba,
  simpanSemuaLombaLanding,
  simpanSemuaLombaDashboard,
  handleUpdateLombaLandingLocal,
  handleUpdateLombaLandingLabelLocal,
  handleUpdateLombaDashboardLocal,
  hapusLomba,
  tanganiUploadLomba
}) => {
  return (
    // Halaman Bagian Lomba
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">

      {/* Container Landing Page */}
      <LombaSection
        title="MANAJEMEN LOMBA LANDING PAGE"
        Icon={LayoutGrid}
        type="landing"
        modeEdit={modeEditLombaLanding}
        setModeEdit={setModeEditLombaLanding}
        onSave={simpanSemuaLombaLanding}
        onAdd={tambahLomba}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            {/* Header Tabel */}
            <tr className="bg-[#0B255D] border-b border-white/20">
              <th className="px-3 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[90px]">Foto</th>
              <th className="px-3 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[210px]">Judul Lomba</th>
              <th className="px-3 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[260px]">Jenjang</th>
              <th className="px-3 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap">Deskripsi</th>
              <th className="px-3 py-3 text-[10px] font-black text-white uppercase tracking-wide text-center whitespace-nowrap w-[60px]">Aksi</th>
            </tr>
          </thead>

          {/* Isi Tabel */}
          <tbody className="divide-y divide-slate-200">
            {daftarLombaLanding.map((lomba) => (
              <tr key={lomba.id} className="hover:bg-slate-50/50 transition-colors group text-slate-600">
                {/* Container Foto */}
                <td className="px-3 py-3 border-r border-slate-200 text-center">
                  <div className="relative w-16 aspect-video rounded-lg bg-slate-100 overflow-hidden border border-slate-200 inline-block">
                    {/* Tampilan Foto */}
                    <img src={lomba.gambar || '/aset/logo/placeholder.png'} className="w-full h-full object-cover" />

                    {/* Mode Edit Foto */}
                    {modeEditLombaLanding && (
                      <button
                        onClick={() => document.getElementById(`file-lomba-landing-${lomba.id}`).click()}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Upload className="text-white" size={12} />
                        <input
                          type="file"
                          id={`file-lomba-landing-${lomba.id}`}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => tanganiUploadLomba(lomba.id, 'landing', e.target.files[0])}
                        />
                      </button>
                    )}
                  </div>
                </td>

                {/* Container Judul Lomba */}
                <InputCell
                  isEdit={modeEditLombaLanding}
                  value={lomba.judul}
                  onChange={(val) => handleUpdateLombaLandingLocal(lomba.id, 'judul', val)}
                  classNameText="text-slate-600 uppercase"
                />

                {/* Container Jenjang */}
                <td className="px-3 py-2 border-r border-slate-200 text-center w-[260px]">
                  {modeEditLombaLanding ? (
                    <div className="flex flex-col gap-1.5 justify-center items-center">
                      {[0, 1].map((index) => (
                        <div key={index} className="flex gap-1 items-center w-full justify-center">
                          {/* Label */}
                          <span className="text-[11.5px] font-medium text-slate-500 w-16 text-left">Jenjang {index + 1}</span>
                          {/* Input Kategori */}
                          <input
                            placeholder="Teks"
                            value={(Array.isArray(lomba.label) ? lomba.label[index]?.teks : null) || ''}
                            onChange={(e) => handleUpdateLombaLandingLabelLocal(lomba.id, index, 'teks', e.target.value)}
                            style={{ paddingLeft: '4px', paddingRight: '4px' }}
                            className="bg-white border border-slate-200 rounded py-0.5 text-[10px] font-medium outline-none w-[75px] uppercase text-center"
                          />

                          {/* Input Sub Jenjang */}
                          <input
                            placeholder="Sub"
                            value={(Array.isArray(lomba.label) ? lomba.label[index]?.sub : null) || ''}
                            onChange={(e) => handleUpdateLombaLandingLabelLocal(lomba.id, index, 'sub', e.target.value)}
                            style={{ paddingLeft: '4px', paddingRight: '4px' }}
                            className="bg-white border border-slate-200 rounded py-0.5 text-[10px] font-medium outline-none w-[115px] text-center"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Menampilkan Jenjang
                    <div className="flex flex-col gap-1 items-center justify-center">
                      {Array.isArray(lomba.label) && lomba.label.length > 0 ? (
                        lomba.label.map((lbl, idx) => (
                          <div key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold text-center border border-slate-200 min-w-[100px]">
                            <span className="uppercase">{lbl.teks}</span>
                            {lbl.sub && <span className="block text-[8px] text-slate-500 font-normal normal-case">{lbl.sub}</span>}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Tidak ada jenjang</span>
                      )}
                    </div>
                  )}
                </td>

                {/* Deskripsi */}
                <td className="px-3 py-3 border-r border-slate-200">
                  {modeEditLombaLanding ? (
                    <textarea
                      value={lomba.deskripsi}
                      onChange={(e) => handleUpdateLombaLandingLocal(lomba.id, 'deskripsi', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11.5px] font-medium text-slate-500 outline-none h-12 resize-none"
                    />
                  ) : (
                    <p className="text-[11.5px] font-medium text-slate-500 leading-relaxed line-clamp-2 capitalize">{lomba.deskripsi}</p>
                  )}
                </td>

                {/* Tautan & Aksi */}
                <td className="px-3 py-3 text-center">
                  <button onClick={() => hapusLomba(lomba.id, 'landing')} className="text-rose-500 hover:text-rose-700 p-2 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </LombaSection>

      {/* Container Dashboard Peserta */}
      <LombaSection
        title="MANAJEMEN LOMBA DASHBOARD PESERTA"
        Icon={Users}
        type="dashboard"
        modeEdit={modeEditLombaDashboard}
        setModeEdit={setModeEditLombaDashboard}
        onSave={simpanSemuaLombaDashboard}
        onAdd={tambahLomba}
      >
        <table className="w-full text-left border-collapse">
          {/* Header Tabel */}
          <thead>
            <tr className="bg-[#0B255D] border-b border-white/20">
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[90px]">Ikon</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[200px]">Nama Cabang</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[120px]">Jenjang</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[130px]">Harga</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[110px]">Kuota</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[130px]">Tanggal</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide border-r border-white/10 text-center whitespace-nowrap w-[80px]">Status</th>
              <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-wide text-center whitespace-nowrap w-[60px]">Aksi</th>
            </tr>
          </thead>

          {/* Isi Tabel */}
          <tbody className="divide-y divide-slate-200">
            {daftarLombaDashboard.map((lomba) => (
              <tr key={lomba.id} className="hover:bg-slate-50/50 transition-colors group text-slate-600">
                {/* Container Upload Gambar */}
                <td className="px-4 py-3 border-r border-slate-200 text-center">
                  <div className="relative w-16 aspect-video rounded-lg bg-slate-100 overflow-hidden border border-slate-200 inline-block">
                    {/* Tampilan Gambar */}
                    <img src={lomba.gambar || '/aset/logo/placeholder.png'} className="w-full h-full object-cover" />
                    {modeEditLombaDashboard && (
                      // Tombol Upload
                      <button
                        onClick={() => document.getElementById(`file-lomba-dashboard-${lomba.id}`).click()}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >

                        {/* Teks Upload */}
                        <Upload className="text-white" size={12} />
                        <input
                          type="file"
                          id={`file-lomba-dashboard-${lomba.id}`}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => tanganiUploadLomba(lomba.id, 'dashboard', e.target.files[0])}
                        />
                      </button>
                    )}
                  </div>
                </td>

                {/* Nama Lomba */}
                <InputCell
                  isEdit={modeEditLombaDashboard}
                  value={lomba.nama}
                  onChange={(val) => handleUpdateLombaDashboardLocal(lomba.id, 'nama', val)}
                  classNameText="text-[#0B255D] uppercase"
                />

                {/* Jenjang */}
                <InputCell
                  isEdit={modeEditLombaDashboard}
                  value={lomba.jenjang}
                  onChange={(val) => handleUpdateLombaDashboardLocal(lomba.id, 'jenjang', val)}
                  classNameText="text-slate-500 uppercase"
                />

                <InputCell
                  isEdit={modeEditLombaDashboard}
                  value={lomba.harga}
                  onChange={(val) => handleUpdateLombaDashboardLocal(lomba.id, 'harga', val)}
                  classNameText="text-slate-700 capitalize"
                />

                {/* Nama Tim */}
                <InputCell
                  isEdit={modeEditLombaDashboard}
                  value={lomba.tim}
                  onChange={(val) => handleUpdateLombaDashboardLocal(lomba.id, 'tim', val)}
                  classNameText="text-slate-500 capitalize"
                />

                {/* Tanggal */}
                <InputCell
                  isEdit={modeEditLombaDashboard}
                  value={lomba.tanggal}
                  onChange={(val) => handleUpdateLombaDashboardLocal(lomba.id, 'tanggal', val)}
                  classNameText="text-slate-500 capitalize"
                />

                {/* Status Lomba */}
                <td className="px-4 py-3 border-r border-slate-200 text-center">
                  <div className="flex justify-center">
                    <label className={`relative inline-flex items-center group ${modeEditLombaDashboard ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        disabled={!modeEditLombaDashboard}
                        checked={lomba.status === 'Open'}
                        onChange={(e) => handleUpdateLombaDashboardLocal(lomba.id, 'status', e.target.checked ? 'Open' : 'Close')}
                      />
                      <div className="w-9 h-5 bg-rose-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </td>

                {/* Tombol Hapus */}
                <td className="px-4 py-3 text-center">
                  <button onClick={() => hapusLomba(lomba.id, 'dashboard')} className="text-rose-500 hover:text-rose-700 p-2 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </LombaSection>
    </div>
  );
};

export default Lomba;
