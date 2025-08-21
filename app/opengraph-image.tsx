import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  // @ts-ignore - btoa exists in edge runtime
  return btoa(binary)
}

export default async function OpengraphImage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://jastipdigw.gorillaworkout.id"
  const logoUrl = `${base}/jastipdigw.webp`

  // Fetch logo and inline as data URL to avoid external fetch issues
  const res = await fetch(logoUrl, { cache: "no-store" })
  const buf = await res.arrayBuffer()
  const base64 = arrayBufferToBase64(buf)
  const dataUrl = `data:image/webp;base64,${base64}`

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="JastipdiGW" width={520} height={520} />
      </div>
    ),
    {
      ...size,
    }
  )
}
