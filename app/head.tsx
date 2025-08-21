export default function Head() {
  const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID || "0"
  return (
    <>
      <meta property="fb:app_id" content={fbAppId} />
    </>
  )
}
