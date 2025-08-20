import { LoginForm } from "@/components/auth/login-form"
import { RoleRedirect } from "@/components/auth/role-redirect"

export default function LoginPage() {
  return (
    <>
      <RoleRedirect />
      <LoginForm />
    </>
  )
}
