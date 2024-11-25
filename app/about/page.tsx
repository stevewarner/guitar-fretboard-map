import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
};

const About = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">About</h1>
        <p>this is the about page</p>
      </div>
    </>
  );
};

export default About;
