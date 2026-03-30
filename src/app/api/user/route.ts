import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import dbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

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
    const user = await User.findById(userId).select('momentum points');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      momentum: user.momentum || 0,
      points: user.points || 0
    });
  } catch (error) {
    console.error('User Data Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
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

  const body = await req.json();
  const { momentum, points } = body;

  await dbConnect();
  try {
    const updateData: { momentum?: number; points?: number } = {};

    if (typeof momentum === 'number') {
      updateData.momentum = Math.max(0, Math.min(100, momentum));
    }

    if (typeof points === 'number') {
      updateData.points = Math.max(0, points);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: 'momentum points' }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      momentum: user.momentum || 0,
      points: user.points || 0
    });
  } catch (error) {
    console.error('User Data Update Error:', error);
    return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
  }
}