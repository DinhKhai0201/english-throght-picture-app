import "./globals.css";
import RegisterSw from "../components/register-sw";

export const metadata = {
  title: "English Through Pictures",
  description: "Interactive reader with OCR JSON and click-to-speak playback.",
  manifest: "/manifest.webmanifest",
  applicationName: "English Through Pictures",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "English Through Pictures",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/apple-icon",
  },
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
