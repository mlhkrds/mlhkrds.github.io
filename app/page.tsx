import { About } from '@/components/about/About';
import { Backdrop } from '@/components/backdrop/Backdrop';
import { Companies } from '@/components/companies/Companies';
import { Contact } from '@/components/contact/Contact';
import { Experience } from '@/components/experience/Experience';
import { Footer } from '@/components/footer/Footer';
import { Hero } from '@/components/hero/Hero';
import { Nav } from '@/components/nav/Nav';
import { Now } from '@/components/now/Now';
import { Stack } from '@/components/stack/Stack';
import { Story } from '@/components/story/Story';
import { Work } from '@/components/work/Work';

export default function Home() {
  return (
    <>
      <Backdrop />
      <Nav />
      <main>
        <Hero />
        <Companies />
        <About />
        <Story />
        <Work />
        <Experience />
        <Stack />
        <Now />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
