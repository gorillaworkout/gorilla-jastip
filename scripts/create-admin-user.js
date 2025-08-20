import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createAdminUser() {
  try {
    console.log("Creating admin user...")

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, "admin@jastip.com", "admin123")

    const user = userCredential.user
    console.log("Firebase user created:", user.uid)

    // Add user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: "admin@jastip.com",
      name: "Admin",
      role: "admin",
      createdAt: new Date(),
    })

    console.log("Admin user created successfully!")
    console.log("Email: admin@jastip.com")
    console.log("Password: admin123")
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("Admin user already exists!")
    } else {
      console.error("Error creating admin user:", error)
    }
  }
}

createAdminUser()
