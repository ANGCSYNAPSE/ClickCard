import Head from "next/head";
import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing · ClickCard</title>
        <meta
          name="description"
          content="Simple, transparent pricing for ClickCard. Start free, upgrade to Pro or Business anytime."
        />
      </Head>
      <main className="relative">
        <Navbar />
        <div className="pt-24">
          <Pricing />
        </div>
        <Footer />
      </main>
    </>
  );
}
