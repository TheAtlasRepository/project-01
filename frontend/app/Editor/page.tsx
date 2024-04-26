'use client';
import dynamic from 'next/dynamic';

const DynamicEditor = dynamic(
  () => import('../../components/component/editor'),
  { ssr: false }
);

// This comment is added here because GitHub is hanging at "Checking for ability to merge automatically…"
export default function Page() {
  return (
    <main>
      <DynamicEditor />
    </main>
  );
}