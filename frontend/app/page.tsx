import Analytics from "@/components/analytics/analytics";
import Faq from "@/components/faq/faq";
import Hero from "@/components/hero";
import HeroMobile from "@/components/hero-mobile";
import HowItWorks from "@/components/how-it-works";
import Stats from "@/components/stats";
import WhyErn from "@/components/why-ern";

export default function Home() {
  return (
    <main>
      <div className="hidden md:block">
        <Hero />
      </div>
      <div className="block md:hidden">
        <HeroMobile />
      </div>

      <Stats />
      <Analytics />
      <HowItWorks />
      <WhyErn />
      <Faq />
    </main>
  );
}
