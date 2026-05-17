import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export function IconDesign() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #fbf7ee 0%, #efe7d8 100%)",
        fontFamily: "Georgia, serif",
        color: "#201c17",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 356,
          height: 436,
          borderRadius: 42,
          background: "#fffdf7",
          border: "8px solid rgba(32, 28, 23, 0.18)",
          boxShadow: "0 24px 54px rgba(32, 28, 23, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 36,
            bottom: 36,
            width: 8,
            borderRadius: 999,
            background: "rgba(181, 90, 54, 0.2)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div style={{ fontSize: 62, letterSpacing: 8, color: "#b55a36" }}>ETP</div>
          <div style={{ fontSize: 150, lineHeight: 1 }}>Aa</div>
          <div style={{ fontSize: 38, color: "#6c6357" }}>Speak to Learn</div>
        </div>
      </div>
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(<IconDesign />, size);
}
