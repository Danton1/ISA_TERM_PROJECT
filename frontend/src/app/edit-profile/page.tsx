// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
import { ProfileHeader } from "./components/profile-header"
import { AccountSettings } from "./components/account-settings"

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Profile & Settings</h1>
      <div className="grid gap-8">
        <ProfileHeader />
        <div className="grid gap-8 md:grid-cols-[250px_1fr]">
          <div className="hidden md:block space-y-2">
            <div className="font-medium text-lg">Settings</div>
            <nav className="grid gap-1">
              <a href="#account" className="px-3 py-2 text-sm rounded-md bg-muted">
                Account
              </a>
            </nav>
          </div>
          <div className="space-y-10">
            <section id="account">
              <AccountSettings />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}