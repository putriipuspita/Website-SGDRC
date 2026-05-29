import PenyediaNotifikasi from "@/components/element/PenyediaNotifikasi";
import "./globals.css";

export const metadata = {
  title: "SGDRC 2026 - Sunan Gunung Djati Robotic Competition",
  description: "Beyond Competition: With Small Action, Make Your Creation Become A Champion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,800;0,900;1,800;1,900&family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full selection:bg-brand-red selection:text-white">
        <PenyediaNotifikasi />
        {children}
      </body>
    </html>
  );
}
