export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from 'app/lib/prisma';
import { auth } from 'app/auth';
import { cache } from 'react';
import { z } from 'zod';

// Cache the user lookup
const getUser = cache(async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
});

// Cache the activities count
const getActivitiesCount = cache(async (userId: number) => {
  return prisma.userActivity.count({
    where: { userId },
  });
});

// Validation schemas
const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

const activitySchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

// GET /api/activities - Get user activities
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUser(session.user.email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate pagination parameters
    const { searchParams } = new URL(request.url);
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });
    const skip = (page - 1) * limit;

    // Get total count and fetch activities in parallel
    const [total, activities] = await Promise.all([
      getActivitiesCount(user.id),
      prisma.userActivity.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          type: true,
          description: true,
          metadata: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })
    ]);

    return NextResponse.json({
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create a new activity
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUser(session.user.email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { type, description, metadata } = activitySchema.parse(body);

    const activity = await prisma.userActivity.create({
      data: {
        userId: user.id,
        type,
        description,
        metadata: metadata || {},
      },
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        createdAt: true,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid activity data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}