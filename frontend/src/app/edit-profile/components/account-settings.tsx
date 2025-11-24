// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useEffect } from "react"

export function AccountSettings() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/account/get-user")
      const data = await res.json()
      setName(data.name)
    }
    fetchUser()
  }, [])

  const handleNameSubmit = async () => {
    try {
      const res = await fetch("/api/account/change-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })

      if (!res.ok) throw new Error("Failed to update name")
      console.log("Name updated:", name)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePasswordSubmit = async () => {
    try {
      const res = await fetch("/api/account/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      })

      if (!res.ok) throw new Error("Failed to update password")
      setPassword("")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Update your account information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Change Name</h3>
          <div className="space-y-2">
            <Label htmlFor="name">New Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your new name" />
          </div>
          <Button onClick={handleNameSubmit} className="w-full sm:w-auto">
            Save Name
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-semibold">Change Password</h3>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
            />
          </div>
          <Button onClick={handlePasswordSubmit} className="w-full sm:w-auto">
            Save Password
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
