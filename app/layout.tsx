import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar/Navbar";
import { StoreProvider } from "@/store/redux/Provider";
import ChatWidget from "@/components/shared/ChatWidget/ChatWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "PF. Shoes | Minimalist Footwear",
  description: "Cửa hàng giày phong cách tối giản cao cấp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} antialiased`}
      >
        <StoreProvider>
          <Navbar />
          <main>{children}</main>
          <ChatWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
