import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email || "",
      is_admin: false,
    })
    profile = { id: user.id, email: user.email || "", is_admin: false, created_at: new Date().toISOString() }
  }

  if (!profile?.is_admin) {
    redirect("/vote")
  }

  const { data: pizzas } = await supabase.from("pizzas").select("*").order("order_position")

  return <AdminDashboard pizzas={pizzas || []} />
}
