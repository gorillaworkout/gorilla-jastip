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
          background: "#ffffff",
        }}
      >
        {/* Logo besar di tengah, tanpa border */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="JastipdiGW" width={520} height={520} />
      </div>
    ),
    {
      ...size,
    }
  )
}
