import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function OpengraphImage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://jastipdigw.gorillaworkout.id"
  const logo = `${base}/jastipdigw.webp`

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1220",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
          }}
        >
          <div
            style={{
              width: 480,
              height: 480,
              background: "#ffffff",
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="JastipdiGW" width={360} height={360} />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
