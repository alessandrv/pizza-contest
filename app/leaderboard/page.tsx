import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Leaderboard } from "@/components/leaderboard"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all pizzas with their votes
  const { data: pizzas } = await supabase.from("pizzas").select(`
      id,
      name,
      votes (
        category_1,
        category_2,
        category_3,
        category_4,
        category_5
      )
    `)

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  return <Leaderboard pizzas={pizzas || []} isAdmin={profile?.is_admin || false} />
}
