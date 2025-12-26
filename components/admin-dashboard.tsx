"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit2, Trash2, LogOut } from "lucide-react"

type Pizza = {
  id: string
  contestant_name?: string
  name: string
  is_active: boolean
  order_position: number
}

export function AdminDashboard({ pizzas: initialPizzas }: { pizzas: Pizza[] }) {
  const [pizzas, setPizzas] = useState(initialPizzas)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPizza, setNewPizza] = useState({ name: "", contestant_name: "" })
  const router = useRouter()
  const supabase = createClient()

  const handleCreatePizza = async () => {
    if (!newPizza.name) return

    const maxPosition = Math.max(...pizzas.map((p) => p.order_position), 0)
    const { error } = await supabase.from("pizzas").insert({
      name: newPizza.name,
      contestant_name: newPizza.contestant_name,
      order_position: maxPosition + 1,
    })

    if (!error) {
  setNewPizza({ name: "", contestant_name: "" })
      setIsCreating(false)
      router.refresh()
    }
  }

  const handleUpdatePizza = async (id: string, updates: Partial<Pizza>) => {
    const { error } = await supabase.from("pizzas").update(updates).eq("id", id)

    if (!error) {
      setEditingId(null)
      router.refresh()
    }
  }

  const handleDeletePizza = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pizza?")) return

    const { error } = await supabase.from("pizzas").delete().eq("id", id)

    if (!error) {
      router.refresh()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-orange-900">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your pizza contest</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/vote")} variant="outline">
              Back to Voting
            </Button>
            <Button onClick={() => router.push("/leaderboard")} variant="outline">
              Leaderboard
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Pizza</CardTitle>
            <CardDescription>Add a new contestant to the competition</CardDescription>
          </CardHeader>
          <CardContent>
            {!isCreating ? (
              <Button onClick={() => setIsCreating(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Pizza
              </Button>
            ) : (
              <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pizza-name">Pizza Name</Label>
                    <Input
                      id="pizza-name"
                      placeholder="Margherita Supreme"
                      value={newPizza.name}
                      onChange={(e) => setNewPizza({ ...newPizza, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contestant-name">Contestant Name</Label>
                    <Input
                      id="contestant-name"
                      placeholder="John Doe"
                      value={newPizza.contestant_name}
                      onChange={(e) => setNewPizza({ ...newPizza, contestant_name: e.target.value })}
                    />
                  </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePizza}>Create</Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pizza List</CardTitle>
            <CardDescription>Manage and activate pizzas for voting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pizzas.length === 0 ? (
                <p className="text-center text-muted-foreground">No pizzas yet. Create one to get started!</p>
              ) : (
                pizzas.map((pizza) => (
                  <div key={pizza.id} className="flex items-center justify-between rounded-lg border p-4">
                    {editingId === pizza.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={pizza.name}
                          onChange={(e) => {
                            const updated = pizzas.map((p) => (p.id === pizza.id ? { ...p, name: e.target.value } : p))
                            setPizzas(updated)
                          }}
                        />
                        <Input
                          value={pizza.contestant_name}
                          onChange={(e) => {
                            const updated = pizzas.map((p) =>
                              p.id === pizza.id ? { ...p, contestant_name: e.target.value } : p,
                            )
                            setPizzas(updated)
                          }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdatePizza(pizza.id, pizza)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setPizzas(initialPizzas)
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{pizza.name}</h3>
                            {pizza.contestant_name && (
                              <p className="text-sm text-muted-foreground ml-2">by {pizza.contestant_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingId(pizza.id)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeletePizza(pizza.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
