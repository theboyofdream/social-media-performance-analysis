import { execLangFlow } from "@/lib/langflow-snippet";
import { NextResponse } from "next/server";

export async function POST(request) {
    const input = await request.text();
    console.log({input})
    
    const output = await execLangFlow(input, "chat", "chat", false);
    console.log({output})

  return NextResponse.json({output});
}
