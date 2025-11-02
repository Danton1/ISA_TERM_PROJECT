import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">ISA Project</h1>
          <p className="text-muted-foreground">
            Learn the best Education Pathway for you!
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Dashboard (Protected)</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}