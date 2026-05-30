'use client';
import dynamic from 'next/dynamic';

const PesertaLomba = dynamic(
  () => import('@/components/admin/peserta/PesertaLomba'),
  { ssr: false }
);

export default function Page() {
  return <PesertaLomba />;
}
