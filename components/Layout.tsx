import Head from 'next/head';
import Navbar from './Navbar';
import { useRouter } from 'next/router';

interface props {
  title?: string;
  keywords?: string;
  description?: string;
  children: React.ReactNode;
}

const Layout: React.FC<props> = ({
  title,
  keywords,
  description,
  children,
}) => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Head>
      <Navbar />
      <div className="flex">
        <div className="container mx-auto">{children}</div>
      </div>
    </>
  );
};

Layout.defaultProps = {
  title: 'Music Theory',
  description: 'Music theory lessons and resources',
  keywords: 'music, theory, guitar, scales, chords',
};

export default Layout;
