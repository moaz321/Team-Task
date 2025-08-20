// src/app/api/healthz/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      app: "Team Tasks",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
