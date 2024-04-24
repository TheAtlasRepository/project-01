'use client';
import Editor from '../../components/component/editor';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();
    // check window object to see if we are in the browser or not then redirect to the home page
    if (typeof window == 'undefined') {
        router.push('/');
    }
    return (
        <main>
            {typeof window !== 'undefined' ? <Editor /> : null} 
        </main>
    );
}