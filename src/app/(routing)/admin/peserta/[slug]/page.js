'use client';
import { useParams } from 'next/navigation';
import PesertaLomba from '@/components/admin/peserta/PesertaLomba';

export default function Page() {
  const params = useParams();
  return <PesertaLomba />;
}
