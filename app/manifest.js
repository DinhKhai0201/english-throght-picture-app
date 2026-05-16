export default function manifest() {
  return {
    id: "com.etp.reader.v1",
    name: "English Through Pictures",
    short_name: "ETP Reader",
    description: "Interactive English Through Pictures reader with tap-to-speak playback.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#efe7d8",
    theme_color: "#fbf7ee",
    orientation: "portrait",
    lang: "en",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
