import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth"
import { hash } from "bcryptjs"

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id; 
    const body = await req.json()
    const { password } = body

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const hashed = await hash(password, 10)

    const updatedUser = await prisma.account.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
