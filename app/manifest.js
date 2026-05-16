export default function manifest() {
  return {
    name: "English Through Pictures",
    short_name: "ETP Reader",
    description: "Interactive English Through Pictures reader with tap-to-speak playback.",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#efe7d8",
    theme_color: "#fbf7ee",
    orientation: "portrait",
    lang: "en",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
