// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Mail, MapPin } from "lucide-react"

export function ProfileHeader() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/v1/account/get-user")
      const data = await res.json()
      setUser(data)
    }

    fetchUser()
  }, [])

  if (!user) return <p>Loading...</p>

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change avatar</span>
            </Button>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold">{user.name}</h2>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          </div>

          <div className="md:ml-auto">
            <Button>Edit Profile</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}