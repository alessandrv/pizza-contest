"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, LogOut, Settings, Trophy } from "lucide-react"

type Vote = {
  category_1: number
  category_2: number
  category_3: number
  category_4: number
  category_5: number
}

type Pizza = {
  id: string
  name: string
  votes: Vote[]
}

type LeaderboardProps = {
  pizzas: Pizza[]
  isAdmin: boolean
}

type PizzaScore = {
  id: string
  name: string
  category1Avg: number
  category2Avg: number
  category3Avg: number
  category4Avg: number
  category5Avg: number
  overallAvg: number
  voteCount: number
}

const categories = [
  { key: "category1Avg" as const, label: "Mozzarellosità", tab: "mozzarella" },
  { key: "category2Avg" as const, label: "Pomodorosità", tab: "pomodoro" },
  { key: "category3Avg" as const, label: "Crostosità", tab: "crosta" },
  { key: "category4Avg" as const, label: "Impasto", tab: "impasto" },
  { key: "category5Avg" as const, label: "Soddisfazione", tab: "soddisfazione" },
]

export function Leaderboard({ pizzas, isAdmin }: LeaderboardProps) {
  const [selectedTab, setSelectedTab] = useState("overall")
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
            category1Avg: 0,
            category2Avg: 0,
            category3Avg: 0,
            category4Avg: 0,
            category5Avg: 0,
            overallAvg: 0,
            voteCount: 0,
          }
        }

        const category1Avg = votes.reduce((sum, v) => sum + v.category_1, 0) / votes.length
        const category2Avg = votes.reduce((sum, v) => sum + v.category_2, 0) / votes.length
        const category3Avg = votes.reduce((sum, v) => sum + v.category_3, 0) / votes.length
        const category4Avg = votes.reduce((sum, v) => sum + v.category_4, 0) / votes.length
        const category5Avg = votes.reduce((sum, v) => sum + v.category_5, 0) / votes.length
        const overallAvg = (category1Avg + category2Avg + category3Avg + category4Avg + category5Avg) / 5

        return {
          id: pizza.id,
          name: pizza.name,
          category1Avg,
          category2Avg,
          category3Avg,
          category4Avg,
          category5Avg,
          overallAvg,
          voteCount: votes.length,
        }
      })
      .sort((a, b) => b.overallAvg - a.overallAvg)
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
        data.map((pizza, index) => (
          <div key={pizza.id} className="flex items-center gap-4 rounded-lg border p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xl font-bold text-white">
              {index === 0 ? <Trophy className="h-6 w-6" /> : index + 1}
            </div>
            <div className="flex-1">
              {isAdmin ? (
                <>
                  <h3 className="font-semibold">{pizza.name}</h3>
                  <p className="text-sm text-muted-foreground">Admin View</p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold">Pizza #{index + 1}</h3>
                  <p className="text-sm text-muted-foreground">Contestant hidden</p>
                </>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {selectedTab === "overall"
                  ? pizza.overallAvg.toFixed(2)
                  : selectedTab === "mozzarella"
                    ? pizza.category1Avg.toFixed(2)
                    : selectedTab === "pomodoro"
                      ? pizza.category2Avg.toFixed(2)
                      : selectedTab === "crosta"
                        ? pizza.category3Avg.toFixed(2)
                        : selectedTab === "impasto"
                          ? pizza.category4Avg.toFixed(2)
                          : pizza.category5Avg.toFixed(2)}
              </div>
              <Badge variant="secondary" className="mt-1">
                {pizza.voteCount} {pizza.voteCount === 1 ? "vote" : "votes"}
              </Badge>
            </div>
          </div>
        ))
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
