import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import dbConnect from "@/backend/lib/mongodb";
import Task from "@/backend/models/Task";
import { ratelimit } from "@/backend/lib/ratelimit";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON if needed (Gemini sometimes adds markdown blocks)
    const jsonString = text.replace(/```json|```/g, "").trim();
    const generatedTasks = JSON.parse(jsonString);

    // 4. Save to Database
    await dbConnect();
    const savedTasks = await Promise.all(
      generatedTasks.map((task: any) => 
        Task.create({
          userId: (session.user as any).id,
          title: task.title,
          estimatedTime: task.estimated_time_minutes,
          urgency: task.urgency_score,
          importance: task.importance_score,
          status: 'pending'
        })
      )
    );

    return NextResponse.json({ tasks: savedTasks });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate tasks" }, { status: 500 });
  }
}
