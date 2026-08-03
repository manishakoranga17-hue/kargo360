import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Products from "@/components/sections/Products";
import ValueChain from "@/components/sections/ValueChain";
import Features from "@/components/sections/Features";
import Platform from "@/components/sections/Platform";
import Faq from "@/components/sections/Faq";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Products />
      <ValueChain />
      <Platform />
      <Features />
      <Faq />
      <Footer />
    </>
  );
}
