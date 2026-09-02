import type { Jastiper } from "./types"

const FBCDN_HOSTS = ["fbcdn.net", "facebook.com/tr", "scontent."]

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}

/**
 * Production Firestore records (public read, verified 2026-09-02):
 * - Bayu Darmawan (wFpySuhS1wiCV2b3j4FU): facebook.com/bayu.darmawan02,
 *   verifiedBy facebook.com/jesicameigamutiah, phone +6287700600208
 * - Jastip Neng Jesi (0hggioCIs088Ik5KpgaU): facebook share URL,
 *   verifiedBy facebook.com/bayu.darmawan02, phone 6287723812303
 * - Nyai Masnea (b7YWwtBfY10Hf160Vn3V): unverified, phone 6281284141495
 * - Rini Lasmalasari (vVu8g2Lm884RC6O7y5Ec): unverified, phone 87772515115 (missing 62)
 *
 * QA: jesicameigamutiah appears on Bayu's card; bayu.darmawan02 appears as
 * Neng Jesi's Facebook. Those profile URLs belong on the matching person.
 * Facebook CDN avatars are expired; replace with in-repo assets.
 */
const OVERRIDES_BY_ID: Record<string, Partial<Jastiper>> = {
  wFpySuhS1wiCV2b3j4FU: {
    name: "Bayu Darmawan",
    imageUrl: "/avatars/bayu-darmawan.svg",
    facebookLink: "https://www.facebook.com/bayu.darmawan02/",
    verifiedByFacebookLink: "https://www.facebook.com/bayu.darmawan02/",
    phoneNumber: "6287700600208",
  },
  "0hggioCIs088Ik5KpgaU": {
    name: "Jastip Neng Jesi",
    imageUrl: "/avatars/neng-jesi.svg",
    facebookLink: "https://www.facebook.com/jesicameigamutiah",
    verifiedByFacebookLink: "https://www.facebook.com/jesicameigamutiah",
    phoneNumber: "6287723812303",
  },
  b7YWwtBfY10Hf160Vn3V: {
    name: "Nyai Masnea",
    imageUrl: "/avatars/nyai-masnea.svg",
    phoneNumber: "6281284141495",
  },
  vVu8g2Lm884RC6O7y5Ec: {
    name: "Rini Lasmalasari",
    imageUrl: "/avatars/rini-lasmalasari.svg",
    phoneNumber: "6287772515115",
  },
}

const OVERRIDES_BY_NAME: Record<string, Partial<Jastiper>> = {
  "bayu darmawan": OVERRIDES_BY_ID.wFpySuhS1wiCV2b3j4FU,
  "jastip neng jesi": OVERRIDES_BY_ID["0hggioCIs088Ik5KpgaU"],
  "neng jesi": OVERRIDES_BY_ID["0hggioCIs088Ik5KpgaU"],
  "nyai masnea": OVERRIDES_BY_ID.b7YWwtBfY10Hf160Vn3V,
  "rini lasmalasari": OVERRIDES_BY_ID.vVu8g2Lm884RC6O7y5Ec,
}

export function isFragileImageUrl(url: string | undefined): boolean {
  if (!url) return true
  const lower = url.toLowerCase()
  return FBCDN_HOSTS.some((host) => lower.includes(host))
}

export function normalizeWhatsAppNumber(phone: string | undefined): string {
  if (!phone) return ""
  let digits = phone.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`
  } else if (digits.startsWith("8")) {
    digits = `62${digits}`
  }
  return digits
}

export function whatsappHref(phone: string | undefined): string {
  const digits = normalizeWhatsAppNumber(phone)
  return digits ? `https://wa.me/${digits}` : ""
}

export function applyJastiperDisplayFixes(jastiper: Jastiper): Jastiper {
  const nameKey = normalizeName(jastiper.name || "")
  const byName = OVERRIDES_BY_NAME[nameKey] || {}
  const byId = (jastiper.id && OVERRIDES_BY_ID[jastiper.id]) || {}
  const merged: Jastiper = {
    ...jastiper,
    ...byName,
    ...byId,
  }

  if (isFragileImageUrl(merged.imageUrl)) {
    merged.imageUrl = byId.imageUrl || byName.imageUrl || "/placeholder-user.jpg"
  }

  if (merged.phoneNumber) {
    merged.phoneNumber = normalizeWhatsAppNumber(merged.phoneNumber)
  }

  return merged
}
