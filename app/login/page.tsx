import { LoginForm } from "@/components/auth/login-form"
import { RoleRedirect } from "@/components/auth/role-redirect"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <>
      <RoleRedirect />
      <div className="h-screen relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Geometric shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 h-full flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {/* Logo section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl shadow-2xl mb-6 p-4 ring-4 ring-blue-400/20">
                <Image 
                  src="/jastipdigw.png" 
                  alt="JastipdiGW Logo" 
                  width={80} 
                  height={80}
                  className="object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                JastipdiGW
              </h1>
              <p className="text-blue-200 text-base font-medium">Admin Dashboard</p>
            </div>

            {/* Login form - integrated design */}
            <div className="space-y-4">
              <LoginForm />
            </div>

            {/* Back to Home button */}
            <div className="text-center mt-6">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-blue-300 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-xl border border-blue-400/30 hover:border-blue-300/50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Home
              </Link>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-sm text-blue-300/70">
                © 2024 JastipdiGW. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Futuristic bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>
    </>
  )
}
