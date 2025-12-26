import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VotingInterface } from "@/components/voting-interface"

export default async function VotePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all pizzas
  const { data: allPizzas } = await supabase.from("pizzas").select("*").order("order_position")

  // Get user's existing votes
  const { data: existingVotes } = await supabase
    .from("votes")
    .select("*")
    .eq("user_id", user.id)

  // Get all non-admin users
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, username, is_admin")
    .eq("is_admin", false)

  // Get all votes for all pizzas
  const { data: allVotes } = await supabase
    .from("votes")
    .select("pizza_id, user_id")

  let { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email || "",
      is_admin: false,
    })
    profile = { is_admin: false }
  }

  return (
    <VotingInterface
      pizzas={allPizzas || []}
      existingVotes={existingVotes || []}
      allUsers={allUsers || []}
      allVotes={allVotes || []}
      userId={user.id}
      isAdmin={profile?.is_admin || false}
    />
  )
}
