import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const lang = searchParams.get("lang") || "en";

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const encodedText = encodeURIComponent(text);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodedText}`;

    const urlCandidates = [
      googleTtsUrl,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(googleTtsUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(googleTtsUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(googleTtsUrl)}`,
    ];

    let audioBuffer = null;
    let contentType = "audio/mpeg";
    let lastError = "Unknown TTS failure";

    for (const candidateUrl of urlCandidates) {
      try {
        const audioResponse = await fetch(candidateUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
          },
          cache: "no-store",
        });

        if (!audioResponse.ok) {
          throw new Error(`HTTP ${audioResponse.status}`);
        }

        const buffer = await audioResponse.arrayBuffer();

        if (buffer.byteLength < 100) {
          throw new Error(`Response too small (${buffer.byteLength} bytes)`);
        }

        const firstBytes = new Uint8Array(buffer.slice(0, 4));
        const headerHex = Array.from(firstBytes)
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");

        if (headerHex.startsWith("3c21444f") || headerHex.startsWith("3c68746d")) {
          throw new Error("Received HTML instead of audio");
        }

        audioBuffer = buffer;
        contentType = audioResponse.headers.get("content-type") || "audio/mpeg";
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : "TTS fetch failed";
      }
    }

    if (!audioBuffer) {
      return NextResponse.json(
        {
          ok: false,
          error: lastError,
        },
        { status: 502 },
      );
    }

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to build TTS URL",
      },
      { status: 500 },
    );
  }
}
