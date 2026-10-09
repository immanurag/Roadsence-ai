import Hero from "../components/home/Hero";
import StatsPreview from "../components/home/StatsPreview";
import About from "../components/home/About";
import Features from "../components/home/Features";
import CTASection from "../components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsPreview />
      <About />
      <Features />
      <CTASection />
    </>
  );
}
