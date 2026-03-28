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

  await dbConnect();
  try {
    const tasks = await Task.find({ 
      userId: (session.user as any).id,
      status: 'pending' 
    }).sort({ createdAt: -1 });
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, importance, urgency, estimatedTime, deadline } = await req.json();
  
  await dbConnect();
  try {
    const task = await Task.create({
      userId: (session.user as any).id,
      title,
      description,
      importance: parseInt(importance),
      urgency: parseInt(urgency),
      estimatedTime: parseInt(estimatedTime),
      deadline: deadline ? new Date(deadline) : null,
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

  const { id, status } = await req.json();
  
  await dbConnect();
  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: (session.user as any).id },
      { status },
      { new: true }
    );
    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
