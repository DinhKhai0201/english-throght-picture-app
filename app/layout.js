import "./globals.css";
import { Suspense } from "react";
import PwaManager from "./components/PwaManager";

export const metadata = {
  title: "English Through Chunks & Pictures",
  description: "Học ngoại ngữ qua Chunks, IELTS Speaking 30 ngày, 500 câu phỏng vấn và phản xạ giao tiếp tự nhiên.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ETP Chunks",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <Suspense fallback={null}>
          <PwaManager />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
