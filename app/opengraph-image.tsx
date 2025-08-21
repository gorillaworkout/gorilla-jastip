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
              width: 420,
              height: 420,
              background: "#ffffff",
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
            }}
          >
            {/* Logo diperkecil dan berada dalam kanvas putih agar tidak terpotong */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="JastipdiGW" width={300} height={300} />
          </div>
          <div
            style={{
              marginTop: 28,
              color: "#E6E8F0",
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: -1,
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            JastipdiGW
          </div>
          <div
            style={{
              marginTop: 8,
              color: "#9aa4b2",
              fontSize: 26,
              fontWeight: 500,
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            Jasa Titip Jepang ⇄ Indonesia • Cepat • Aman • Transparan
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
