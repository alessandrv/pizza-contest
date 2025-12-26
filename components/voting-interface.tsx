"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LogOut, Settings, XCircle } from "lucide-react"

type Pizza = {
  id: string
  name: string
  is_active: boolean
}

type Vote = {
  pizza_id: string
  category_1: number
  category_2: number
  category_3: number
  category_4: number
  category_5: number
}

type User = {
  id: string
  username: string
  is_admin: boolean
}

type AllVote = {
  pizza_id: string
  user_id: string
}

type VotingInterfaceProps = {
  pizzas: Pizza[]
  existingVotes: Vote[]
  allUsers: User[]
  allVotes: AllVote[]
  userId: string
  isAdmin: boolean
}

const categories = [
  { key: "category_1" as const, label: "MOZZARELLOSITÀ", description: "Considera qualità e quantità della mozzarella a seconda dei tuoi gusti" },
  { key: "category_2" as const, label: "POMODOROSITÀ", description: "Considera qualità e quantità di pomodoro a seconda dei tuoi gusti" },
  { key: "category_3" as const, label: "CROSTOSITÀ", description: "Considera se è bruciata o no e se croccante o morbida a seconda del tuo gusto" },
  { key: "category_4" as const, label: "TIPO DI IMPASTO", description: "Considera consistenza, cottura e grossa o sottile a seconda di cosa preferisci" },
  { key: "category_5" as const, label: "SODDISFAZIONE COMPLESSIVA", description: "Valuta zozzosità e quanto ti scalda il cuore" },
]

export function VotingInterface({ pizzas, existingVotes, allUsers, allVotes, userId, isAdmin }: VotingInterfaceProps) {
  const [selectedPizzaId, setSelectedPizzaId] = useState<string>(pizzas[0]?.id || "")
  const selectedPizza = pizzas.find((p) => p.id === selectedPizzaId)
  const existingVote = existingVotes.find((v) => v.pizza_id === selectedPizzaId)
  
  const [scores, setScores] = useState({
    category_1: existingVote?.category_1 ?? 0,
    category_2: existingVote?.category_2 ?? 0,
    category_3: existingVote?.category_3 ?? 0,
    category_4: existingVote?.category_4 ?? 0,
    category_5: existingVote?.category_5 ?? 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Calculate voting status for selected pizza
  const votingStatus = useMemo(() => {
    if (!selectedPizzaId) return null

    const votedUserIds = new Set(
      allVotes.filter((v) => v.pizza_id === selectedPizzaId).map((v) => v.user_id)
    )
    
    const votedUsers = allUsers.filter((u) => votedUserIds.has(u.id))
    const pendingUsers = allUsers.filter((u) => !votedUserIds.has(u.id))

    return {
      totalUsers: allUsers.length,
      votedUsers: votedUsers.length,
      votedUsernames: votedUsers.map((u) => u.username),
      pendingUsers: pendingUsers.length,
      pendingUsernames: pendingUsers.map((u) => u.username),
    }
  }, [selectedPizzaId, allUsers, allVotes])

  // Update scores when pizza selection changes
  const handlePizzaChange = (pizzaId: string) => {
    setSelectedPizzaId(pizzaId)
    const vote = existingVotes.find((v) => v.pizza_id === pizzaId)
    setScores({
      category_1: vote?.category_1 ?? 0,
      category_2: vote?.category_2 ?? 0,
      category_3: vote?.category_3 ?? 0,
      category_4: vote?.category_4 ?? 0,
      category_5: vote?.category_5 ?? 0,
    })
    setMessage(null)
  }

  const handleSubmit = async () => {
    if (!selectedPizza) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const { error } = await supabase.from("votes").upsert({
        user_id: userId,
        pizza_id: selectedPizza.id,
        category_1: scores.category_1,
        category_2: scores.category_2,
        category_3: scores.category_3,
        category_4: scores.category_4,
        category_5: scores.category_5,
      })

      if (error) throw error

      setMessage({ type: "success", text: "Vote submitted successfully!" })
      router.refresh()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to submit vote" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-orange-900">Pizza Contest</h1>
            <p className="text-muted-foreground">Rate the current pizza</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => router.push("/admin")}>
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {pizzas.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-96 items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-muted-foreground">No Pizzas Available</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  There are no pizzas to vote on yet
                </p>
                {isAdmin && (
                  <Button className="mt-4" onClick={() => router.push("/admin")}>
                    Go to Admin Panel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Select Pizza to Vote</CardTitle>
                <CardDescription className="text-center">Choose a pizza and rate it</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Select value={selectedPizzaId} onValueChange={handlePizzaChange}>
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Choose a pizza" />
                    </SelectTrigger>
                    <SelectContent>
                      {pizzas.map((pizza) => {
                        const hasVoted = existingVotes.some((v) => v.pizza_id === pizza.id)
                        return (
                          <SelectItem key={pizza.id} value={pizza.id}>
                            {pizza.name} {hasVoted && "✓"}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {selectedPizza && (
                    <h2 className="text-3xl font-bold">{selectedPizza.name}</h2>
                  )}
                </div>
              </CardContent>
            </Card>

            {votingStatus && votingStatus.pendingUsers > 0 && (
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Missing ({votingStatus.pendingUsers}/{votingStatus.totalUsers}):</span>
                <div className="flex flex-wrap items-center gap-1">
                  {votingStatus.pendingUsernames.slice(0, 8).map((username) => (
                    <Badge key={username} variant="outline" className="px-2 py-0.5 text-xs">
                      {username}
                    </Badge>
                  ))}
                  {votingStatus.pendingUsernames.length > 8 && (
                    <span className="text-xs text-muted-foreground">+{votingStatus.pendingUsernames.length - 8}</span>
                  )}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Rate This Pizza</CardTitle>
                <CardDescription>Score each category from 0 to 10 (half points allowed)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {categories.map(({ key, label, description }) => (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">{label}</Label>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">{scores[key]}</span>
                    </div>
                    <Slider
                      value={[scores[key]]}
                      onValueChange={([value]) => setScores({ ...scores, [key]: value })}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>2.5</span>
                      <span>5</span>
                      <span>7.5</span>
                      <span>10</span>
                    </div>
                  </div>
                ))}

                {message && (
                  <div
                    className={`rounded-lg p-4 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Submitting..." : existingVote ? "Update Vote" : "Submit Vote"}
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/leaderboard")}>
                    View Leaderboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
