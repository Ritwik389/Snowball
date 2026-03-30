import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPassword = typeof password === 'string' ? password.trim() : '';

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return NextResponse.json({ message: 'User created successfully', userId: user._id }, { status: 201 });
  } catch (error: unknown) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
