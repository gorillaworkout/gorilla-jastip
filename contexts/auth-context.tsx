"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { 
  type User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db, isFirebaseConfigured } from "@/lib/firebase"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user exists in Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          
          if (userDoc.exists()) {
            // User exists, get their data
            const userData = userDoc.data() as Omit<User, "id">
            setUser({ id: firebaseUser.uid, ...userData })
          } else {
            // New user, create default profile
            const defaultUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "User",
              role: "user", // Default role
              createdAt: new Date(),
            }
            
            // Save to Firestore
            await setDoc(doc(db, "users", firebaseUser.uid), defaultUser)
            setUser(defaultUser)
          }
          
          setFirebaseUser(firebaseUser)
        } catch (error) {
          console.error("Error handling user auth state:", error)
        }
      } else {
        setUser(null)
        setFirebaseUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [mounted])

  // Don't render children until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  const loginWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase Auth not initialized")
    }

    try {
      console.log("🚀 Starting Google login...")
      console.log("🔐 Auth object:", auth)
      console.log("🔐 Current user:", auth.currentUser)
      
      const provider = new GoogleAuthProvider()
      
      // Add scopes if needed
      provider.addScope('email')
      provider.addScope('profile')
      
      console.log("🔐 Google provider created:", provider)
      
      const result = await signInWithPopup(auth, provider)
      
      console.log("✅ Google login successful!")
      console.log("👤 User:", result.user)
      console.log("📧 Email:", result.user.email)
      console.log("🆔 UID:", result.user.uid)
      
      // User will be handled by onAuthStateChanged
    } catch (error: any) {
      console.error("❌ Google login error:", error)
      console.error("❌ Error code:", error.code)
      console.error("❌ Error message:", error.message)
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Login dibatalkan oleh user. Silakan coba lagi.")
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error("Popup diblokir oleh browser. Izinkan popup untuk domain ini.")
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error("Domain tidak diizinkan. Hubungi administrator.")
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error("Gagal koneksi jaringan. Periksa koneksi internet Anda.")
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error("Google login tidak diizinkan. Hubungi administrator.")
      } else {
        throw new Error(`Gagal login dengan Google: ${error.message}`)
      }
    }
  }

  const logout = async () => {
    if (auth) {
      await signOut(auth)
    }
    setUser(null)
    setFirebaseUser(null)
  }

  const value = {
    user,
    firebaseUser,
    loading,
    loginWithGoogle,
    logout,
    isConfigured: !!isFirebaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}