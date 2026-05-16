import "./globals.css";

export const metadata = {
  title: "English Through Pictures",
  description: "Interactive reader with OCR JSON and click-to-speak playback.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
