"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, LogOut, Settings, Trophy, ChevronDown, ChevronUp } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type Vote = {
  category_1: number
  category_2: number
  category_3: number
  category_4: number
  category_5: number
  user_id: string
  profiles?: {
    username: string
    is_admin: boolean
  }
}

type User = {
  id: string
  username: string
  is_admin: boolean
}

type Pizza = {
  id: string
  name: string
  contestant_name?: string
  votes: Vote[]
}

type LeaderboardProps = {
  pizzas: Pizza[]
  allUsers: User[]
  isAdmin: boolean
}

type PizzaScore = {
  id: string
  name: string
  contestant_name?: string
  category1Total: number
  category2Total: number
  category3Total: number
  category4Total: number
  category5Total: number
  overallTotal: number
  voteCount: number
  votes: Vote[]
}

const categories = [
  { key: "category1Total" as const, label: "Mozzarellosità", tab: "mozzarella" },
  { key: "category2Total" as const, label: "Pomodorosità", tab: "pomodoro" },
  { key: "category3Total" as const, label: "Crostosità", tab: "crosta" },
  { key: "category4Total" as const, label: "Impasto", tab: "impasto" },
  { key: "category5Total" as const, label: "Soddisfazione", tab: "soddisfazione" },
]

export function Leaderboard({ pizzas, allUsers, isAdmin }: LeaderboardProps) {
  const [selectedTab, setSelectedTab] = useState("overall")
  const [expandedPizzaId, setExpandedPizzaId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const scores = useMemo(() => {
    return pizzas
      .map((pizza) => {
        const votes = pizza.votes
        if (votes.length === 0) {
          return {
            id: pizza.id,
            name: pizza.name,
            contestant_name: (pizza as any).contestant_name,
            category1Total: 0,
            category2Total: 0,
            category3Total: 0,
            category4Total: 0,
            category5Total: 0,
            overallTotal: 0,
            voteCount: 0,
            votes: [],
          }
        }

        const category1Total = votes.reduce((sum, v) => sum + v.category_1, 0)
        const category2Total = votes.reduce((sum, v) => sum + v.category_2, 0)
        const category3Total = votes.reduce((sum, v) => sum + v.category_3, 0)
        const category4Total = votes.reduce((sum, v) => sum + v.category_4, 0)
        const category5Total = votes.reduce((sum, v) => sum + v.category_5, 0)
        const overallTotal = category1Total + category2Total + category3Total + category4Total + category5Total

        return {
          id: pizza.id,
          name: pizza.name,
          contestant_name: (pizza as any).contestant_name,
          category1Total,
          category2Total,
          category3Total,
          category4Total,
          category5Total,
          overallTotal,
          voteCount: votes.length,
          votes: pizza.votes,
        }
      })
      .sort((a, b) => b.overallTotal - a.overallTotal)
  }, [pizzas])

  const getSortedByCategory = (categoryKey: keyof PizzaScore) => {
    return [...scores].sort((a, b) => (b[categoryKey] as number) - (a[categoryKey] as number))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const renderLeaderboard = (data: PizzaScore[]) => (
    <div className="space-y-4">
      {data.length === 0 ? (
        <p className="text-center text-muted-foreground">No votes yet. Be the first to vote!</p>
      ) : (
        data.map((pizza, index) => {
          const votedUserIds = new Set(pizza.votes.map((v) => v.user_id))
          const missingUsers = allUsers.filter((u) => !votedUserIds.has(u.id))
          
          return (
            <Collapsible
              key={pizza.id}
              open={expandedPizzaId === pizza.id}
              onOpenChange={(open) => setExpandedPizzaId(open ? pizza.id : null)}
            >
              <div className="rounded-lg border">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xl font-bold text-white">
                      {index === 0 ? <Trophy className="h-6 w-6" /> : index + 1}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold">{pizza.name}</h3>
                      {isAdmin && pizza.contestant_name && (
                        <p className="text-sm text-muted-foreground">by {pizza.contestant_name}</p>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedTab === "overall"
                            ? pizza.overallTotal.toFixed(1)
                            : selectedTab === "mozzarella"
                              ? pizza.category1Total.toFixed(1)
                              : selectedTab === "pomodoro"
                                ? pizza.category2Total.toFixed(1)
                                : selectedTab === "crosta"
                                  ? pizza.category3Total.toFixed(1)
                                  : selectedTab === "impasto"
                                    ? pizza.category4Total.toFixed(1)
                                    : pizza.category5Total.toFixed(1)}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {pizza.voteCount} {pizza.voteCount === 1 ? "vote" : "votes"}
                        </Badge>
                      </div>
                      {expandedPizzaId === pizza.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t p-4 bg-muted/30">
                    <h4 className="font-semibold mb-3 text-sm">Vote Breakdown</h4>
                    <div className="space-y-2">
                      {/* Show users who voted */}
                      {pizza.votes.map((vote) => (
                        <div key={vote.user_id} className="flex items-center justify-between text-sm border-b pb-2">
                          <span className="font-medium">{vote.profiles?.username || "Unknown"}</span>
                          <div className="flex gap-4 text-xs">
                            {selectedTab === "overall" ? (
                              <>
                                <span>M: {vote.category_1}</span>
                                <span>P: {vote.category_2}</span>
                                <span>C: {vote.category_3}</span>
                                <span>I: {vote.category_4}</span>
                                <span>S: {vote.category_5}</span>
                                <span className="font-semibold">
                                  Tot: {(vote.category_1 + vote.category_2 + vote.category_3 + vote.category_4 + vote.category_5).toFixed(1)}
                                </span>
                              </>
                            ) : selectedTab === "mozzarella" ? (
                              <span className="font-semibold">{vote.category_1}</span>
                            ) : selectedTab === "pomodoro" ? (
                              <span className="font-semibold">{vote.category_2}</span>
                            ) : selectedTab === "crosta" ? (
                              <span className="font-semibold">{vote.category_3}</span>
                            ) : selectedTab === "impasto" ? (
                              <span className="font-semibold">{vote.category_4}</span>
                            ) : (
                              <span className="font-semibold">{vote.category_5}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Show missing users */}
                      {missingUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between text-sm border-b pb-2 text-muted-foreground">
                          <span>{user.username}</span>
                          <span className="text-xs">?</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )
        })
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-orange-900">Leaderboard</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "See how each pizza ranks" : "Anonymous rankings - identities hidden until contest ends"}
            </p>
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

        <Button variant="ghost" className="mb-4" onClick={() => router.push("/vote")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Voting
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Contest Results</CardTitle>
            <CardDescription>Rankings by category and overall score</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile dropdown */}
            <div className="mb-4 md:hidden">
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall</SelectItem>
                  <SelectItem value="mozzarella">Mozzarellosità</SelectItem>
                  <SelectItem value="pomodoro">Pomodorosità</SelectItem>
                  <SelectItem value="crosta">Crostosità</SelectItem>
                  <SelectItem value="impasto">Tipo di Impasto</SelectItem>
                  <SelectItem value="soddisfazione">Soddisfazione Complessiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="hidden md:block">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overall">Overall</TabsTrigger>
                <TabsTrigger value="mozzarella">Mozzarella</TabsTrigger>
                <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                <TabsTrigger value="crosta">Crosta</TabsTrigger>
                <TabsTrigger value="impasto">Impasto</TabsTrigger>
                <TabsTrigger value="soddisfazione">Soddisfazione</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Results display */}
            <div className="mt-6">
              {selectedTab === "overall" ? (
                renderLeaderboard(scores)
              ) : (
                <>
                  {categories.map(({ key, tab }) =>
                    selectedTab === tab ? renderLeaderboard(getSortedByCategory(key)) : null
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
