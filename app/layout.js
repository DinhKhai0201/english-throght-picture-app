import "./globals.css";
import RegisterSw from "../components/register-sw";

export const metadata = {
  title: "English Through Pictures",
  description: "Interactive reader with OCR JSON and click-to-speak playback.",
  manifest: "/manifest.webmanifest",
  applicationName: "English Through Pictures",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "English Through Pictures",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/apple-icon",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf7ee",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RegisterSw />
        {children}
      </body>
    </html>
  );
}
