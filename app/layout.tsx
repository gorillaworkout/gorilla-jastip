import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ReduxProvider } from "@/contexts/redux-provider"

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
})

const playfair = Playfair_Display({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-playfair",
})

export const metadata: Metadata = {
	metadataBase: new URL("https://jastipdigw.gorillaworkout.id"),
	title: {
		default: "JastipdiGW – Jasa Titip Jepang & Indonesia",
		template: "%s | JastipdiGW",
	},
	description:
		"JastipdiGW melayani titip barang Indonesia ⇄ Jepang dan checkout marketplace Jepang. Cepat, aman, transparan.",
	keywords: [
		"jastip",
		"jasa titip",
		"jastip jepang",
		"titip barang jepang",
		"checkout rakuten",
		"checkout amazon jp",
		"mercari",
		"indonesia jepang",
	],
	authors: [{ name: "Bayu Darmawan" }],
	creator: "Bayu Darmawan",
	publisher: "JastipdiGW",
	openGraph: {
		title: "JastipdiGW – Jasa Titip Jepang & Indonesia",
		description:
			"Titip barang Indonesia ⇄ Jepang dan checkout marketplace Jepang. Cepat, aman, transparan.",
		url: "https://jastipdigw.gorillaworkout.id",
		siteName: "JastipdiGW",
		images: [
			{
				url: "/jastipdigw.webp",
				secureUrl: "https://jastipdigw.gorillaworkout.id/jastipdigw.webp",
				width: 1200,
				height: 630,
				alt: "JastipdiGW",
				type: "image/webp",
			},
			{
				url: "/placeholder-logo.png",
				secureUrl: "https://jastipdigw.gorillaworkout.id/placeholder-logo.png",
				width: 1200,
				height: 630,
				alt: "JastipdiGW",
				type: "image/png",
			},
		],
		locale: "id_ID",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "JastipdiGW – Jasa Titip Jepang & Indonesia",
		description:
			"Titip barang Indonesia ⇄ Jepang dan checkout marketplace Jepang. Cepat, aman, transparan.",
		images: [
			"https://jastipdigw.gorillaworkout.id/placeholder-logo.png",
			"https://jastipdigw.gorillaworkout.id/jastipdigw.webp",
		],
		creator: "@jastipdigw",
		site: "@jastipdigw",
	},
	alternates: {
		canonical: "https://jastipdigw.gorillaworkout.id/",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-snippet': -1,
			'max-image-preview': 'large',
			'max-video-preview': -1,
		},
	},
	generator: "Gorichan",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="id" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
			<body className="font-sans antialiased">
				<ReduxProvider>
					<AuthProvider>{children}</AuthProvider>
				</ReduxProvider>
			</body>
		</html>
	)
}
