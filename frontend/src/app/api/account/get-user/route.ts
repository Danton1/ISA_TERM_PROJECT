import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id; 
    
    const user = await prisma.user.findUnique({
        where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    })

     if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return the user data
    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
