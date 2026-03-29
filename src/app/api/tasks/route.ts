import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import dbConnect from '@/backend/lib/mongodb';
import Task from '@/backend/models/Task';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const tasks = await Task.find({ 
      userId,
      status: 'pending' 
    }).sort({ createdAt: -1 });
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Task Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as {
    title?: string;
    description?: string;
    importance?: string | number;
    urgency?: string | number;
    estimatedTime?: string | number;
    deadline?: string;
  };
  
  await dbConnect();
  try {
    const task = await Task.create({
      userId,
      title: body.title,
      description: body.description,
      importance: body.importance !== undefined ? parseInt(String(body.importance), 10) : 0,
      urgency: body.urgency !== undefined ? parseInt(String(body.urgency), 10) : 0,
      estimatedTime: body.estimatedTime !== undefined ? parseInt(String(body.estimatedTime), 10) : 0,
      deadline: body.deadline ? new Date(body.deadline) : null,
      status: 'pending'
    });
    return NextResponse.json({ task });
  } catch (error) {
    console.error('Task Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as { id?: string; status?: string };
  
  await dbConnect();
  try {
    const task = await Task.findOneAndUpdate(
      { _id: body.id, userId },
      { status: body.status },
      { new: true }
    );
    return NextResponse.json({ task });
  } catch (error) {
    console.error('Task Update Error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
