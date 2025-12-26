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

  // Get all pizzas with their votes (excluding votes from admins)
  const { data: pizzas } = await supabase.from("pizzas").select(`
      id,
      name,
      votes!inner (
        category_1,
        category_2,
        category_3,
        category_4,
        category_5,
        user_id,
        profiles!inner (
          is_admin
        )
      )
    `)

  // Filter out votes from admin users
  const pizzasWithFilteredVotes = pizzas?.map((pizza: any) => ({
    ...pizza,
    votes: pizza.votes.filter((vote: any) => !vote.profiles.is_admin),
  }))

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  return <Leaderboard pizzas={pizzasWithFilteredVotes || []} isAdmin={profile?.is_admin || false} />
}
