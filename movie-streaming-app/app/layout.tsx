import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "MovieStream - Watch Movies & Series Online",
  description: "Stream your favorite movies and series in HD quality. No login required.",
  manifest: "/manifest.json",
  themeColor: "#1f2937",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MovieStream",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white antialiased font-sans">
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
