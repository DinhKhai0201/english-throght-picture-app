import "./globals.css";
import RegisterSw from "../components/register-sw";

export const metadataBase = new URL("https://english-throgh-picture.vercel.app");

export const metadata = {
  title: "English Through Pictures",
  description: "Interactive reader with OCR JSON and click-to-speak playback.",
  applicationName: "English Through Pictures",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "ETP Reader",
  },
  formatDetection: {
    telephone: false,
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
