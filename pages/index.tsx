import Layout from '@/components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <main className="flex flex-col items-center justify-between p-24">
        <h1>
          look up a chord in the url like{' '}
          <Link href={'/chord/Cmajor'}>Cmajor</Link>
        </h1>
      </main>
    </Layout>
  );
}
