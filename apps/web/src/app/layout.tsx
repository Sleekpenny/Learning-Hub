import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/providers";
import "./globals.css";


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg-base text-text-primary">
        {/* Without JavaScript the hero items would stay hidden, so show them */}
        <noscript>
          <style>{"[data-hero]{opacity:1!important}"}</style>
        </noscript>
        {/* Lets keyboard users jump past the menu */}
        <a
          href="#main"
          className="sr-only rounded-lg bg-white px-4 py-2 font-semibold text-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
