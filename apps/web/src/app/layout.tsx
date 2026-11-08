import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/components/providers";

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg-base text-text-primary">
        <Providers>
          {children}
          </Providers> 
      </body>
    </html>
  );
}
export default RootLayout;
