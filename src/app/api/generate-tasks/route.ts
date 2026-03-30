import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import dbConnect from "@/backend/lib/mongodb";
import Task from "@/backend/models/Task";
import { ratelimit } from "@/backend/lib/ratelimit";

type GeneratedTask = {
  title: string;
  estimated_time_minutes: number;
  urgency_score: number;
  importance_score: number;
};

function isGeneratedTaskArray(value: unknown): value is GeneratedTask[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    const record = item as Record<string, unknown>;
    return (
      typeof record.title === "string" &&
      typeof record.estimated_time_minutes === "number" &&
      typeof record.urgency_score === "number" &&
      typeof record.importance_score === "number"
    );
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });
    }

    // 1. Check Rate Limit
    if (ratelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
      }
    }

    // 2. Parse Request
    const { goal } = await req.json();
    if (!goal) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    const prompt = `
      You are an expert productivity coach. 
      The user has a vague, overwhelming goal: "${goal}".
      Break this goal down into a small set of (3-7) highly actionable micro-tasks.
      
      Requirements for each micro-task:
      - title: Short, concise action (e.g., "Sort one pile of papers").
      - estimated_time_minutes: Conservative estimate of how long it takes (5 to 120 minutes).
      - urgency_score: 1-10 (How soon this needs to happen to meet a typical deadline).
      - importance_score: 1-10 (How much value this adds to the overall goal).
      
      Return ONLY a JSON array of objects with these keys. No other text.
    `;

    // 3. Call Groq (OpenAI-compatible)
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You return only valid JSON. No markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      throw new Error(`Groq API error: ${groqResponse.status} ${errText}`);
    }

    const groqData = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = groqData.choices?.[0]?.message?.content ?? "";
    
    // Clean JSON if needed (LLMs sometimes add markdown blocks)
    const jsonString = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonString) as unknown;
    if (!isGeneratedTaskArray(parsed)) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 502 });
    }
    const generatedTasks = parsed;

    // 4. Return generated tasks (without saving yet)
    // User will set deadlines before confirming
    return NextResponse.json({ tasks: generatedTasks });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate tasks" }, { status: 500 });
  }
}
