import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";
import Providers from "@/store/Providers";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Providers>
        <div className="font-sans min-h-screen bg-white text-ink antialiased dark:bg-[#0c0820] dark:text-white">
          <Component {...pageProps} />
        </div>
      </Providers>
    </>
  );
}
