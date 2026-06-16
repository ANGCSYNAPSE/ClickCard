import Head from "next/head";
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
import MobileFeatureNav from "@/components/MobileFeatureNav";

const TITLE = "ClickCard — One link for your whole identity";
const DESC =
  "ClickCard turns your identity into one beautiful, shareable link. Build a digital profile, branded business card, resume & QR — share anywhere in seconds.";

export default function Home() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ClickCard" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
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
        <MobileFeatureNav />
      </main>
    </>
  );
}
