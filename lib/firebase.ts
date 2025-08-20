import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

const isFirebaseConfigured =
  !isDemoMode &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key" &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID

let app: any = null
let db: any = null
let auth: any = null

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig)

    // Initialize Firestore
    db = getFirestore(app)

    // Initialize Auth
    auth = getAuth(app)

    console.log("✅ Firebase initialized successfully")
    console.log("📁 Firestore database:", db ? "Initialized" : "Failed")
    console.log("🔐 Auth service:", auth ? "Initialized" : "Failed")
    console.log("🏗️ Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
} else {
  const reason = isDemoMode
    ? "Demo mode enabled via NEXT_PUBLIC_DEMO_MODE=true"
    : "Firebase environment variables not configured"
  console.warn(`⚠️ ${reason}. Running in demo mode.`)
  console.log("📝 To enable Firebase, add these environment variables:")
  console.log("NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key")
  console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com")
  console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id")
  console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com")
  console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id")
  console.log("NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id")
}

export { db, auth, isFirebaseConfigured, isDemoMode }
export default app
