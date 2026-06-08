import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import HeroCinematic from "@/components/HeroCinematic";
import StatsBar from "@/components/StatsBar";
import ScrollShowcase from "@/components/ScrollShowcase";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import TemplateRail from "@/components/TemplateRail";
import Testimonials from "@/components/Testimonials";
import MobileApp from "@/components/MobileApp";
import Pricing from "@/components/Pricing";
import ReferralBanner from "@/components/ReferralBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Navbar />
      <HeroCinematic />
      <StatsBar />
      <ScrollShowcase />
      <Features />
      <HowItWorks />
      <TemplateRail />
      <Testimonials />
      <ReferralBanner />
      <MobileApp />
      <Pricing />
      <Footer />
    </main>
  );
}
