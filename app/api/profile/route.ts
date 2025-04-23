export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from 'app/lib/prisma';
import { auth } from 'app/auth';
import { logActivity, ActivityTypes } from 'app/lib/activity';
import { cache } from 'react';
import { z } from 'zod';

// Cache the user lookup with more specific type
const getUser = cache(async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

// Validation schema
const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
});

// GET /api/profile - Get user profile
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUser(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);
    
    // Only include fields that are actually provided
    const updateData = Object.entries(validatedData)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        updatedAt: true,
      },
    });

    // Log the profile update activity with only changed fields
    await logActivity(ActivityTypes.PROFILE_UPDATE, 'User updated their profile', {
      updatedFields: Object.keys(updateData),
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}