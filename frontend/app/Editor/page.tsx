'use client';
import dynamic from 'next/dynamic';

const DynamicEditor = dynamic(
  () => import('../../components/component/editor'),
  { ssr: false }
);

export default function Page() {
  return (
    <main>
      <DynamicEditor />
    </main>
  );
}